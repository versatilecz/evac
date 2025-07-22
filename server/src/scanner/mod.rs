use core::time;
use std::{collections::BTreeMap, net::SocketAddr, time::Duration};

use mail_send::mail_auth::arc::parse;
use serde::de;
use serde_json::ser;
use shared::messages::scanner::{self, ScannerContent, ScannerEvent, ScannerMessage, State};
use tokio::{
    net::UdpSocket,
    sync::{broadcast, RwLockWriteGuard},
};
use tracing::event;
use uuid::Uuid;

use crate::{
    context::Context,
    database::{entities::DeviceActivity, LoadSave},
    message::web::{self, WebMessage},
};

mod map;
mod parser;

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
            tracing::info!("Scanner: {:?}", event.scanner);

            if let Some(uuid) = event.scanner {
                if let Some(addr) = self.scanners.get_addr(&uuid) {
                    tracing::info!("Sending message: {:?}", data);
                    return Ok(socket.send_to(&data, addr).await.is_ok());
                } else {
                    tracing::error!("Unable to find device: {:?}", event);
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
            } else {
                tokio::time::sleep(Duration::MAX).await;
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
        let now = chrono::offset::Utc::now();

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
                scanner.1.last_activity = now;
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
                        last_activity: now,
                        ..Default::default()
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
            scanner.1.last_activity = now;
            scanner.1.ip = ip;
            scanner.1.port = port;

            self.scanners.set(scanner.0.clone(), *socket);

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
                    //context.database.data.save(&path).unwrap();

                    if let Some(uuid) = &event.scanner {
                        if let Some(scanner) = context.database.data.scanners.get(uuid) {
                            context.web_broadcast.send(
                                crate::message::web::WebMessage::ScannerDetail(scanner.clone()),
                            );

                            self.send(ScannerEvent {
                                scanner: Some(scanner.uuid),
                                message: ScannerMessage {
                                    uuid: uuid::Uuid::new_v4(),
                                    content: ScannerContent::Set(State {
                                        scan: Some(scanner.scan),
                                        led: Some(scanner.led),
                                        buzzer: Some(scanner.buzzer),
                                    }),
                                },
                            })
                            .await;
                        }
                    }
                }
                shared::messages::scanner::ScannerContent::ScanResult(result) => {
                    let mut send_device = None;
                    let mut enabled = false;
                    let now = chrono::offset::Utc::now();

                    let mut context = self.context.write().await;
                    // let activity_diff = context.database.config.base.activity_diff.clone();

                    let device_uuid = if let Some(device) = context
                        .database
                        .data
                        .devices
                        .values_mut()
                        .find(|d| d.mac == result.mac)
                    {
                        device.last_activity = now;
                        enabled = device.enabled;
                        device.uuid.clone()
                    } else {
                        let uuid = uuid::Uuid::new_v4();
                        let device = crate::database::entities::Device {
                            uuid,
                            name: None,
                            enabled: false,
                            mac: result.mac,
                            battery: None,
                            last_activity: now,
                        };
                        context.database.data.devices.insert(uuid, device.clone());
                        send_device = Some(device.clone());
                        device.uuid
                    };

                    let scanner_uuid = event.scanner.unwrap();
                    let web_broadcast = context.web_broadcast.clone();

                    if let Some(device) = context.database.data.devices.get(&device_uuid).cloned() {
                        if self
                            .process_service(&mut context, scanner_uuid, device.uuid, result.data)
                            .await
                        {
                            enabled = device.enabled;
                            send_device = Some(device.clone());
                        }
                    }

                    if let Some(device) = send_device {
                        if device.name.is_some() {
                            context
                                .web_broadcast
                                .send(crate::message::web::WebMessage::DeviceDetail(device));
                        }
                    }

                    // Send position change
                    if enabled {
                        if context.database.activities.push(
                            device_uuid,
                            scanner_uuid,
                            now,
                            result.rssi.into(),
                        ) {
                            context
                                .web_broadcast
                                .send(crate::message::web::WebMessage::Activity(
                                    crate::message::web::Activity {
                                        device: device_uuid,
                                        scanner: scanner_uuid,
                                        rssi: result.rssi.into(),
                                        timestamp: now,
                                    },
                                ));
                        }
                    }
                }
                _ => {}
            }
        }

        Ok(())
    }

    pub async fn process_service<'a>(
        &self,
        context: &mut RwLockWriteGuard<'a, super::context::Context>,
        scanner: uuid::Uuid,
        device_uuid: uuid::Uuid,
        data: Vec<u8>,
    ) -> bool {
        let mut result = false;
        let mut events = Vec::new();

        if let Some(device) = context.database.data.devices.get_mut(&device_uuid) {
            tracing::debug!(
                "Service advertisement data: {}: {:?}",
                hex::encode(&device.mac),
                data
            );

            let mut parser = parser::Parser::new(data);
            while let Some(parsed) = parser.next() {
                //tracing::debug!("Service data[{}]: {:?}", parsed.tag, parsed.data);
                match parsed.tag {
                    // Short name or long name
                    8 | 9 => {
                        if device.name.is_none() {
                            if let Ok(name) = String::from_utf8(parsed.data) {
                                device.name = Some(name);
                                result = true;
                            }
                        }
                    }
                    // Shelly beacon service
                    22 => {
                        if parsed.data[0..2] == [210, 252] {
                            if device.battery != Some(parsed.data[6]) {
                                device.battery = Some(parsed.data[6]);
                                result = true;
                            }

                            if parsed.data[8] > 0 && device.enabled {
                                let kind = match parsed.data[8] {
                                    1 => crate::database::entities::EventKind::ButtonPressed,
                                    2 => crate::database::entities::EventKind::ButtonDoublePressed,
                                    3 => crate::database::entities::EventKind::ButtonTriplePressed,
                                    4 => crate::database::entities::EventKind::ButtonLongPressed,
                                    254 => crate::database::entities::EventKind::ButtonHold,
                                    _ => crate::database::entities::EventKind::Advertisement,
                                };
                                events.push(crate::database::entities::Event {
                                    device: Some(device.uuid),
                                    uuid: uuid::Uuid::new_v4(),
                                    timestamp: chrono::offset::Utc::now(),
                                    scanner: uuid::Uuid::new_v4(),
                                    kind,
                                });
                            }
                        }
                    }
                    // Unknown/UnImportant tag
                    _ => {
                        //tracing::info!("Unknow data[{}] {:?}", parsed.tag, parsed.data);
                    }
                }
            }
        }

        if let Some(activity) = context.database.activities.best(device_uuid) {
            for mut event in events {
                event.scanner = activity.scanner_uuid;

                if let Some(old_event) = context.database.events.values_mut().find(|e| {
                    e.scanner == activity.scanner_uuid
                        && e.device == Some(device_uuid)
                        && e.kind == event.kind
                }) {
                    old_event.timestamp = event.timestamp;
                    let event = old_event.clone();
                    context.web_broadcast.send(WebMessage::Event(event));
                } else {
                    context
                        .database
                        .events
                        .insert(event.uuid.clone(), event.clone());

                    context.web_broadcast.send(WebMessage::Event(event));
                }
            }
        }
        result
    }
}
