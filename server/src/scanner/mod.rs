use std::net::SocketAddr;

use shared::messages::scanner::{self, ScannerContent, ScannerEvent};
use tokio::{net::UdpSocket, sync::broadcast};
use tracing::event;
use uuid::{timestamp::context, Uuid};

use crate::database::{entities::DeviceActivity, LoadSave};

mod map;

pub struct Scanner {
    context: super::context::ContextWrapped,
    scanners: map::ScannerMap,
    socket: Option<UdpSocket>,
    broadcast: SocketAddr,
}

impl Scanner {
    pub fn new(context: super::context::ContextWrapped, broadcast: SocketAddr) -> Self {
        Self {
            broadcast,
            context,
            scanners: map::ScannerMap::new(),
            socket: None,
        }
    }

    pub async fn send(&self, event: ScannerEvent) -> anyhow::Result<bool> {
        let data = rmp_serde::to_vec(&event.message)?;

        if let Some(socket) = self.socket.as_ref() {
            if let Some(uuid) = event.scanner {
                if let Some(addr) = self.scanners.get_addr(&uuid) {
                    return Ok(socket.send_to(&data, addr).await.is_ok());
                }
            } else {
                return Ok(socket.send_to(&data, self.broadcast).await.is_ok());
            }
        }

        Ok(false)
    }

    pub async fn recv(&mut self, port: SocketAddr) -> anyhow::Result<bool> {
        let mut buf = [0u8; 512];
        if let Some(socket) = self.socket.as_ref() {
            if let Ok((len, addr)) = socket.recv_from(&mut buf).await {
                match rmp_serde::from_slice::<shared::messages::scanner::ScannerMessage>(
                    &buf[..len],
                ) {
                    Ok(msg) => {
                        self.process_socket(addr, msg).await?;
                        return Ok(true);
                    }
                    Err(err) => {
                        tracing::error!("{:?}", err);
                        return Ok(false);
                    }
                }
            }
        } else {
            if let Ok(udp) = tokio::net::UdpSocket::bind(port).await {
                tracing::info!("Server is initialized...");
                if let Err(err) = udp.set_broadcast(true) {
                    tracing::error!("Problem to set broadcast due to: {}", err);
                }
                self.socket = Some(udp);
            }
        }

        return Ok(false);
    }

    pub async fn get_event(
        &mut self,
        socket: &SocketAddr,
        msg: shared::messages::scanner::ScannerMessage,
    ) -> Option<ScannerEvent> {
        let ip = socket.ip().to_string();
        let port = socket.port();

        let mut context = self.context.write().await;

        // Reaction to register msg
        if let ScannerContent::Register { mac } = &msg.content {
            // Mac exists
            if let Some(scanner) = context
                .database
                .data
                .scanners
                .iter_mut()
                .find(|s| s.1.mac.eq(mac))
            {
                scanner.1.last_activity = Some(chrono::offset::Utc::now());
                scanner.1.ip = ip;
                scanner.1.port = port;

                return Some(ScannerEvent {
                    message: msg,
                    scanner: Some(scanner.0.clone()),
                });
            } else {
                // Mac dost not exists
                let uuid = uuid::Uuid::new_v4();
                context.database.data.scanners.insert(
                    uuid,
                    crate::database::entities::Scanner {
                        uuid,
                        ip: ip.clone(),
                        port: port.clone(),
                        mac: mac.clone(),
                        room: None,
                        name: format!("Scanner: {}", hex::encode(mac)),
                        last_activity: Some(chrono::offset::Utc::now()),
                    },
                );

                return Some(ScannerEvent {
                    scanner: Some(uuid),
                    message: msg,
                });
            }
        }

        // Find device by socket pair
        if let Some(scanner) = context
            .database
            .data
            .scanners
            .iter_mut()
            .find(|s| s.1.ip == ip && s.1.port == port)
        {
            scanner.1.last_activity = Some(chrono::offset::Utc::now());
            scanner.1.ip = ip;
            scanner.1.port = port;

            return Some(ScannerEvent {
                message: msg,
                scanner: Some(scanner.0.clone()),
            });
        }

        // Unknown device
        None
    }

    pub async fn process_socket(
        &mut self,
        socket: std::net::SocketAddr,
        msg: shared::messages::scanner::ScannerMessage,
    ) -> anyhow::Result<()> {
        if let Some(event) = self.get_event(&socket, msg).await {
            match event.message.content {
                shared::messages::scanner::ScannerContent::Register { mac } => {
                    tracing::debug!("Received register message: {:?}", mac);
                    let context = self.context.read().await;
                    let path = context.database.config.base.data_path.clone();
                    context.database.data.save(&path).unwrap();

                    if let Some(uuid) = &event.scanner {
                        if let Some(scanner) = context.database.data.scanners.get(uuid) {
                            context.web_broadcast.send(
                                crate::message::web::WebMessage::ScannerDetail(scanner.clone()),
                            );
                        }
                    }
                }
                shared::messages::scanner::ScannerContent::ScanResult(result) => {
                    let now = chrono::offset::Utc::now();

                    tracing::debug!("Received scan result message: {:?}", result);

                    let mut context = self.context.write().await;
                    let device_uuid = if let Some(device) = context
                        .database
                        .data
                        .devices
                        .values()
                        .find(|d| d.mac == result.mac)
                    {
                        device.uuid.clone()
                    } else {
                        let uuid = uuid::Uuid::new_v4();
                        let device = crate::database::entities::Device {
                            uuid,
                            name: result.name,
                            enable: false,
                            mac: result.mac,
                            battery: None,
                            last_activity: Vec::new(),
                        };
                        context.database.data.devices.insert(uuid, device.clone());
                        context
                            .web_broadcast
                            .send(crate::message::web::WebMessage::DeviceDetail(device));

                        uuid
                    };

                    let scanner_uuid = event.scanner.unwrap();

                    if let Some(device) = context.database.data.devices.get_mut(&device_uuid) {
                        if device.enable {
                            device.last_activity = device
                                .last_activity
                                .iter()
                                .filter(|la| {
                                    la.scanner != scanner_uuid
                                        && (now - la.timestamp).num_seconds() < 5
                                })
                                .cloned()
                                .collect();

                            device.last_activity.push(DeviceActivity {
                                irssi: result.rssi as i64,
                                timestamp: now,
                                scanner: scanner_uuid,
                            })
                        }
                    }
                }
                _ => {}
            }
        }
        Ok(())
    }
}
