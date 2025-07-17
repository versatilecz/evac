use std::{
    collections::{BTreeMap, HashMap},
    net::SocketAddr,
    pin::pin,
    time::Instant,
};

use futures::channel::mpsc::Sender;
use shared::messages::{
    global::GlobalMessage,
    scanner::{ScannerEvent, ScannerMessage},
};
use tokio::sync::broadcast;
use uuid::Uuid;

use crate::{database::entities::Device, scanner};

use super::context::{Context, ContextWrapped};
pub struct Server {
    context: ContextWrapped,
    scanner: crate::scanner::Scanner,
    global_sender: tokio::sync::broadcast::Sender<GlobalMessage>,
}

impl Server {
    pub fn new(
        context: ContextWrapped,
        broadcast: SocketAddr,
        global_sender: tokio::sync::broadcast::Sender<GlobalMessage>,
    ) -> Self {
        Self {
            scanner: crate::scanner::Scanner::new(context.clone(), broadcast),
            context,
            global_sender,
        }
    }

    pub async fn run(
        &mut self,
        mut scanner_receiver: tokio::sync::mpsc::Receiver<ScannerEvent>,
    ) -> anyhow::Result<()> {
        'main: loop {
            tracing::debug!("Starting server...");

            let mut web = super::web::Server::new(self.context.clone());
            let web_future: tokio::task::JoinHandle<()> = tokio::spawn(async move {
                let _ = web.run().await;
            });

            let mut global_receiver = self.global_sender.subscribe();
            let scanner_sender = self.context.read().await.scanner_sender.clone();

            let base = self.context.read().await.database.config.base.clone();
            let (port, broadcast) = (base.port_scanner.clone(), base.port_broadcast.clone());

            let sleep_time = std::time::Duration::from_secs(5);
            let mut sleep = Instant::now() + sleep_time;

            loop {
                //tracing::info!("Server loop cycle... {:?}", sleep.elapsed().is_zero());

                tokio::select! {
                    _ = tokio::time::sleep(sleep_time) => {

                    },
                    // Received system message for scanner/ resend to devices
                    Some(event) = scanner_receiver.recv() => {
                        //tracing::info!("Scanner receiver");
                        self.scanner.send(event).await;

                    }

                    _ = self.scanner.recv(SocketAddr::V4(port)) => {
                        //tracing::info!("Recv cycle");
                    }

                    Ok(msg) = global_receiver.recv() => {
                        tracing::info!("Global cycle");
                        match msg {
                            shared::messages::global::GlobalMessage::Reload => {
                                tracing::info!("Reloading server");
                                continue 'main;
                            }

                            shared::messages::global::GlobalMessage::Stop => {
                                tracing::info!("Stopping server");
                                break 'main;
                            }
                            _ => {
                                tracing::error!("Unexpected message");
                                break;
                            }
                        }
                    }
                }

                if !sleep.elapsed().is_zero() {
                    sleep = sleep + sleep_time;
                    Self::scanner_routine(&scanner_sender).await;
                    Self::web_routine(self.context.clone()).await;
                }
            }

            web_future.await?;
        }

        Ok(())
    }

    async fn scanner_routine(
        sender: &tokio::sync::mpsc::Sender<shared::messages::scanner::ScannerEvent>,
    ) {
        tracing::info!("Sending hello");

        let message = shared::messages::scanner::ScannerMessage {
            content: shared::messages::scanner::ScannerContent::Hello,
            uuid: Uuid::new_v4(),
        };
        sender
            .send(shared::messages::scanner::ScannerEvent {
                message,
                scanner: None,
            })
            .await;
    }

    async fn web_routine(context: ContextWrapped) {
        tracing::info!("Sending web positions");
        let mut context = context.write().await;
        let now = chrono::offset::Utc::now();
        let activity_diff = context.database.config.base.activity_diff;

        let old = context.database.data.devices.clone();

        context.database.data.devices = old
            .iter()
            .filter(|(_, v)| v.enable || (now - v.last_activity).num_seconds() < activity_diff)
            .map(|(k, v)| (k.clone(), v.clone()))
            .collect();

        let removed: Vec<uuid::Uuid> = old
            .iter()
            .filter(|(_, v)| !v.enable && (now - v.last_activity).num_seconds() >= activity_diff)
            .map(|(k, _)| k.clone())
            .collect();

        for remove in removed {
            context
                .web_broadcast
                .send(crate::message::web::WebMessage::DeviceRemoved(remove));
        }

        for device in context.database.data.devices.values_mut() {
            device.activities =
                BTreeMap::from_iter(device.activities.iter().filter_map(|(uuid, a)| {
                    if (a.timestamp - now).num_seconds() < activity_diff {
                        Some((uuid.clone(), a.clone()))
                    } else {
                        None
                    }
                }));
        }

        let positions: Vec<crate::message::web::Position> = context
            .database
            .data
            .devices
            .values()
            .filter_map(|d| {
                // If device is enabled, select the most close event
                if d.enable {
                    d.activities
                    .values()
                    .fold(
                        None,
                        |prev: Option<crate::database::entities::DeviceActivity>,
                         item: &crate::database::entities::DeviceActivity| {
                            if let Some(prev) = prev {
                                if prev.irssi < item.irssi {
                                    Some(item.clone())
                                } else {
                                    Some(prev)
                                }
                            } else {
                                Some(item.clone())
                            }
                        },
                    )
                    // Transform device/activity to position message
                    .map(|a| crate::message::web::Position {
                        device: d.uuid,
                        scanner: a.scanner_uuid,
                        rssi: a.irssi,
                        timestamp: a.timestamp,
                    })
                }
                // filter out the rest
                else {
                    None
                }
            })
            .collect();

        // Notify web clients about positions
        context
            .web_broadcast
            .send(crate::message::web::WebMessage::Positions(positions));
    }
}
