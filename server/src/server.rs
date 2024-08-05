use crate::scanner;

use super::context::{Context, ContextWrapped};
pub struct Server {
    context: ContextWrapped,
}

impl Server {
    pub fn new(context: ContextWrapped) -> Self {
        Self { context }
    }

    pub async fn run(&mut self) -> anyhow::Result<()> {
        'main: loop {
            tracing::debug!("Starting server...");
            let mut global_receiver = {
                let context = self.context.write().await;
                context.global_broadcast.subscribe()
            };

            let mut web = super::web::Server::new(self.context.clone());
            let web_future: tokio::task::JoinHandle<()> = tokio::spawn(async move {
                let _ = web.run().await;
            });

            let mut scanner = super::scanner::Server::new(self.context.clone());
            let scanner_future = tokio::spawn(async move { scanner.run().await.unwrap() });

            loop {
                tokio::select! {
                    _ = tokio::time::sleep(std::time::Duration::from_secs(10)) => {
                        self.routine().await;
                    },
                    Ok(msg) = global_receiver.recv() => {
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
                                tracing::error!("Unexpected message")
                            }
                        }
                    }
                }
            }

            web_future.await?;
            scanner_future.await?;
        }
        Ok(())
    }

    async fn routine(&mut self) {
        let context = self.context.read().await;
        let message = shared::messages::scanner::ScannerMessage::Hello(
            context.database.config.base.port_scanner.clone(),
        );

        context
            .scanner_sender
            .send(shared::messages::scanner::ScannerPacket {
                message,
                socket: context.database.config.base.port_broadcast.clone(),
            })
            .await;
    }
}
