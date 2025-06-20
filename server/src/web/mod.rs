use chrono::prelude::DateTime;
use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use warp::{filters::path::path, Filter, Rejection};

pub mod operator;
pub use operator::Operator;

type Result<T> = std::result::Result<T, Rejection>;

pub struct Server {
    context: super::context::ContextWrapped,
}

impl Server {
    pub fn new(context: super::context::ContextWrapped) -> Self {
        Self { context }
    }

    pub fn with_context(
        context: super::context::ContextWrapped,
    ) -> impl Filter<Extract = (crate::context::ContextWrapped,), Error = std::convert::Infallible> + Clone
    {
        warp::any().map(move || context.clone())
    }

    async fn websocket_handler(
        ws: warp::ws::Ws,
        context: super::context::ContextWrapped,
    ) -> Result<impl warp::Reply> {
        Ok(ws.on_upgrade(move |socket| Server::client_connection(socket, context)))
    }

    fn encode(
        msg: &crate::message::web::WebMessage,
    ) -> std::result::Result<warp::ws::Message, String> {
        if let Ok(value) = serde_json::to_string(msg) {
            Ok(warp::ws::Message::text(value))
        } else {
            Err(String::from("Unable encode message"))
        }
    }

    async fn client_connection(ws: warp::ws::WebSocket, context: super::context::ContextWrapped) {
        let uuid = uuid::Uuid::new_v4();
        tracing::debug!("Client connected: {}", uuid);

        let (mut ws_sender, mut ws_receiver) = ws.split();
        let (mut global_receiver, mut web_receiver, query_size) = {
            let context = context.read().await;
            (
                context.global_broadcast.subscribe(),
                context.web_broadcast.subscribe(),
                context.database.config.base.query_size,
            )
        };
        let (sender, mut receiver) =
            tokio::sync::mpsc::channel::<crate::message::web::WebMessage>(query_size);

        {
            let context = context.read().await;
            sender
                .send(crate::message::web::WebMessage::Config(
                    context.database.config.clone(),
                ))
                .await
                .unwrap();

            sender
                .send(crate::message::web::WebMessage::LocationList(
                    context.database.data.locations.values().cloned().collect(),
                ))
                .await
                .unwrap();

            sender
                .send(crate::message::web::WebMessage::RoomList(
                    context.database.data.rooms.values().cloned().collect(),
                ))
                .await
                .unwrap();

            sender
                .send(crate::message::web::WebMessage::ScannerList(
                    context.database.data.scanners.values().cloned().collect(),
                ))
                .await
                .unwrap();

            sender
                .send(crate::message::web::WebMessage::DeviceList(
                    context.database.data.devices.values().cloned().collect(),
                ))
                .await
                .unwrap();
        }

        let client = operator::Operator {
            uuid,
            context,
            sender,
        };

        loop {
            tokio::select! {
                // Global message processing
                msg = global_receiver.recv() => {
                    match msg {
                        Ok(shared::messages::global::GlobalMessage::Reload) => {
                            tracing::info!("Reloading WebSocket");
                        }
                        Ok(shared::messages::global::GlobalMessage::Stop) => {
                            tracing::info!("Stopping WebSocket");
                            break;
                        }
                        Ok(_) => {
                            tracing::error!("Unexpected message");
                            break;
                        },
                        Err(err) => {
                            tracing::error!("{}", err);
                            break;
                        }
                    }
                }

                // Websocket message processing
                msg = ws_receiver.next() => {
                    if let Some(Ok(ws_msg)) = msg {
                        if ws_msg.is_text() {
                            let text_msg = ws_msg.to_str().unwrap();
                            match serde_json::from_str::<crate::message::web::WebMessage>(text_msg) {
                                Ok(message) => {
                                    if let Err(err) = client.process(message).await {
                                        tracing::error!("{}", err);
                                    } else {
                                        continue;
                                    }
                                }
                                Err(err) => {
                                    tracing::error!("{} {}", err, text_msg);
                                }
                            }
                        }
                    }
                    tracing::debug!("No other message");
                    break;
                }

                // Send local message to WS
                Some(msg) = receiver.recv() => {
                    if msg == crate::message::web::WebMessage::Close {
                        let _ = ws_sender.close().await;
                        break;
                    }
                    if let Ok(message_json) = Self::encode(&msg) {
                        if let Err(err) = ws_sender.send(message_json).await {
                            tracing::error!("Unable to send message: {} {:?}", err, msg);
                        }
                    }
                }

                // Send broadcast message to WS
                Ok(msg) = web_receiver.recv() => {
                    if msg == crate::message::web::WebMessage::Close {
                        let _ = ws_sender.close().await;
                        break;
                    }

                    if let Ok(message_json) = Self::encode(&msg) {
                        if let Err(err) = ws_sender.send(message_json).await {
                            tracing::error!("Unable to send message: {} {:?}", err, msg);
                        }
                    }
                }
            }
        }

        tracing::debug!("Client is deth");
    }

    pub fn websocket_route(
        context: crate::context::ContextWrapped,
    ) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone {
        warp::path!("api" / "operator")
            .and(warp::ws())
            .and(Self::with_context(context))
            .and_then(Self::websocket_handler)
    }

    fn routes(
        &self,
        config: crate::database::config::Server,
    ) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone {
        // WebSocket route
        Self::websocket_route(self.context.clone())
            // Serve web pages
            .or(warp::fs::dir(config.base.frontend_path.clone()))
            // Default serve index
            .or(warp::fs::file(format!(
                "{}/index.html",
                config.base.frontend_path
            )))
    }

    pub async fn run(&mut self) -> anyhow::Result<()> {
        let (mut global_receiver, config) = {
            let context = self.context.read().await;
            (
                context.global_broadcast.subscribe(),
                context.database.config.clone(),
            )
        };
        let routes = self.routes(config.clone());
        let (_addr, fut) = warp::serve(routes).bind_with_graceful_shutdown(
            config.base.port_web.clone(),
            async move {
                while let Ok(msg) = global_receiver.recv().await {
                    match msg {
                        shared::messages::global::GlobalMessage::Reload => {
                            tracing::info!("Reloading WebServer");
                        }
                        shared::messages::global::GlobalMessage::Stop => {
                            tracing::info!("Stopping WebServer");
                            break;
                        }
                        shared::messages::global::GlobalMessage::Restart => {
                            tracing::info!("Stopping WebServer");
                            break;
                        }
                    }
                }
            },
        );
        fut.await;
        Ok(())
    }
}
