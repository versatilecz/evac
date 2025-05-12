pub mod scanner;
use std::ops::Add;

use chrono::{Date, DateTime};
pub use scanner::Scanner;

pub struct Server {
    context: super::context::ContextWrapped,
    scanners: std::collections::BTreeMap<std::net::SocketAddrV4, uuid::Uuid>,
}
impl Server {
    pub fn new(context: super::context::ContextWrapped) -> Self {
        Self {
            context,
            scanners: std::collections::BTreeMap::new(),
        }
    }

    pub async fn process(
        &mut self,
        socket: std::net::SocketAddrV4,
        wrapper: shared::messages::scanner::ScannerMessage,
    ) -> anyhow::Result<()> {
        if let Some(id) = self.scanners.get(&socket) {
            let scanner = if let Some(scanner) = self.context.read().await.scanners.get(&id) {
                Some(scanner.clone())
            } else {
                None
            };

            if let Some(mut scanner) = scanner {
                return scanner.process(wrapper).await;
            }
        }

        match wrapper.content {
            shared::messages::scanner::ScannerContent::Register { mac } => {
                let mut context = self.context.write().await;
                let scanner = if let Some(scanner) = context
                    .database
                    .data
                    .scanners
                    .values_mut()
                    .find(|d| mac.eq(&d.mac))
                {
                    scanner::Scanner {
                        uuid: scanner.uuid,
                        socket: socket.clone(),
                        context: self.context.clone(),
                        last_activity: chrono::offset::Utc::now(),
                    }
                } else {
                    scanner::Scanner {
                        uuid: uuid::Uuid::new_v4(),
                        socket,
                        context: self.context.clone(),
                        last_activity: chrono::Utc::now(),
                    }
                };

                self.context.write().await.scanner_set(scanner);
            }
            shared::messages::scanner::ScannerContent::ScanResult(result) => {
                let uuid = uuid::Uuid::new_v4();
                self.scanners.insert(socket.clone(), uuid);
                let scanner = scanner::Scanner {
                    uuid,
                    socket,
                    context: self.context.clone(),
                    last_activity: chrono::Utc::now(),
                };
                {
                    let mut context = self.context.write().await;
                    context.scanner_set(scanner);
                    let event = crate::database::entities::Event {
                        device: Some(uuid::Uuid::new_v4()),
                        uuid: uuid::Uuid::new_v4(),
                        kind: crate::database::entities::EventKind::Advertisement,
                        timestamp: chrono::offset::Utc::now(),
                        scanner: uuid::Uuid::new_v4(),
                    };
                    context
                        .web_broadcast
                        .send(crate::message::web::WebMessage::Event(event))
                        .unwrap();
                }
            }
            _ => {}
        }
        tracing::debug!("Process ends");
        Ok(())
    }

    pub async fn run(&mut self) -> anyhow::Result<()> {
        let (scanner_sender, mut scanner_receiver) = tokio::sync::mpsc::channel(
            self.context
                .read()
                .await
                .database
                .config
                .base
                .query_size
                .clone(),
        );
        self.context.write().await.scanner_sender = scanner_sender;

        let base = self.context.read().await.database.config.base.clone();

        let (port, broadcast) = (base.port_scanner.clone(), base.port_broadcast.clone());

        tracing::debug!("Starting scanner");
        while let Ok(udp) = tokio::net::UdpSocket::bind(port).await {
            let mut buf = [0; 1024];
            if let Err(err) = udp.set_broadcast(true) {
                tracing::error!("Problem to set broadcast due to: {}", err);
            }

            let mut global_broadcast = self.context.read().await.global_broadcast.subscribe();

            tokio::select! {
                data = udp.recv_from(&mut buf) => {
                    if let Ok((len, addr)) = data {
                        match rmp_serde::from_slice::<shared::messages::scanner::ScannerMessage>(
                            &buf[..len],
                        ) {
                            Ok(msg) => {
                                if let std::net::SocketAddr::V4(socket) = addr {
                                    self.process(socket, msg).await?;
                                }
                            }
                            Err(err) => {
                                tracing::error!("{:?}", err);
                            }
                        }
                    }
                }


                Some(event) = scanner_receiver.recv() => {
                    tracing::debug!("Sending message: {:?}", event);

                    let data = rmp_serde::to_vec(&event.message)?;
                    if let Some(socket) = event.socket {
                        udp.send_to(&data, socket).await?;
                    } else {
                        udp.send_to(&data, broadcast).await?;
                    }
                },

                Ok(msg) = global_broadcast.recv() => {
                    break;
                }
            };
        }
        tracing::debug!("Stopping scanner");
        Ok(())
    }
}
