use std::{net::SocketAddr, pin::pin, time::Instant};

use futures::channel::mpsc::Sender;
use shared::messages::{
    global::GlobalMessage,
    scanner::{ScannerEvent, ScannerMessage},
};
use tokio::sync::broadcast;
use uuid::Uuid;

use crate::scanner;

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
                tracing::info!("Server loop cycle... {:?}", sleep.elapsed().is_zero());

                tokio::select! {
                    _ = tokio::time::sleep(sleep_time) => {

                    },
                    // Received system message for scanner/ resend to devices
                    Some(event) = scanner_receiver.recv() => {
                        tracing::info!("Scanner receiver");
                        self.scanner.send(event).await;

                    }

                    _ = self.scanner.recv(SocketAddr::V4(port)) => {
                        tracing::info!("Recv cycle");
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
                    Self::routine(&scanner_sender).await;
                }
            }

            web_future.await?;
        }

        Ok(())
    }

    async fn routine(sender: &tokio::sync::mpsc::Sender<shared::messages::scanner::ScannerEvent>) {
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
            .await
            .unwrap();
    }
}
