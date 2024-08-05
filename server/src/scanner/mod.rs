pub mod scanner;
pub use scanner::Scanner;
use tokio::sync::broadcast;

pub struct Server {
    context: super::context::ContextWrapped,
    scanners: std::collections::BTreeMap<std::net::SocketAddrV4, u64>,
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
        msg: shared::messages::scanner::ScannerMessage,
    ) -> anyhow::Result<()> {
        if let Some(id) = self.scanners.get(&socket) {
            let scanner = if let Some(scanner) = self.context.read().await.scanners.get(&id) {
                Some(scanner.clone())
            } else {
                None
            };

            if let Some(mut scanner) = scanner {
                return scanner.process(msg).await;
            }
        }

        match msg {
            shared::messages::scanner::ScannerMessage::Register(register) => {
                let scanner = scanner::Scanner {
                    id: register.mac,
                    socket,
                    context: self.context.clone(),
                    last_activity: chrono::Utc::now(),
                };
                self.context.write().await.scanner_set(scanner);
            }
            shared::messages::scanner::ScannerMessage::ScanResult(result) => {
                let id = 0;
                self.scanners.insert(socket.clone(), id);
                let scanner = scanner::Scanner {
                    id: id,
                    socket,
                    context: self.context.clone(),
                    last_activity: chrono::Utc::now(),
                };
                {
                    let mut context = self.context.write().await;
                    context.scanner_set(scanner);
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
        let port = self
            .context
            .read()
            .await
            .database
            .config
            .base
            .port_scanner
            .clone();

        tracing::debug!("Starting scanner");
        while let Ok(udp) = tokio::net::UdpSocket::bind(port).await {
            let mut buf = [0; 1024];
            udp.set_broadcast(true);
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
                                tracing::error!("{:?}", err)
                            }
                        }
                    }
                },
                Some(msg) = scanner_receiver.recv() => {
                    tracing::debug!("Sending message: {:?}", msg);
                    udp.send_to(&rmp_serde::to_vec(&msg.message)?, msg.socket).await?;
                }
                Ok(msg) = global_broadcast.recv() => {
                    break;
                }
            }
        }
        tracing::debug!("Stopping scanner");
        Ok(())
    }
}
