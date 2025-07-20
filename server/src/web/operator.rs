use crate::{
    database::{
        config::Email,
        entities::{self, Alarm, Device},
        LoadSave,
    },
    message::web::WebMessage,
};
use shared::messages::scanner::{ScannerEvent, ScannerMessage, State};
use uuid::timestamp::context;

#[derive(Debug, Clone)]
pub struct Operator {
    pub uuid: uuid::Uuid,
    pub context: crate::context::ContextWrapped,
    pub sender: tokio::sync::mpsc::Sender<crate::message::web::WebMessage>,
}

impl Operator {
    pub async fn init(&self) -> anyhow::Result<()> {
        {
            let context = self.context.read().await;
            self.sender
                .send(crate::message::web::WebMessage::Config(
                    context.database.config.clone(),
                ))
                .await?;

            self.sender
                .send(crate::message::web::WebMessage::LocationList(
                    context.database.data.locations.values().cloned().collect(),
                ))
                .await?;

            self.sender
                .send(crate::message::web::WebMessage::RoomList(
                    context.database.data.rooms.values().cloned().collect(),
                ))
                .await?;

            self.sender
                .send(crate::message::web::WebMessage::ScannerList(
                    context.database.data.scanners.values().cloned().collect(),
                ))
                .await?;

            self.sender
                .send(crate::message::web::WebMessage::DeviceList(
                    context.database.data.devices.values().cloned().collect(),
                ))
                .await?;

            self.sender
                .send(crate::message::web::WebMessage::ActivityList(
                    context
                        .database
                        .data
                        .devices
                        .values()
                        .filter_map(|d| {
                            if d.enabled {
                                if let Some(activity) = context.database.activities.best(d.uuid) {
                                    Some(crate::message::web::Activity {
                                        device: d.uuid,
                                        scanner: activity.scanner_uuid,
                                        rssi: activity.irssi,
                                        timestamp: activity.timestamp,
                                    })
                                } else {
                                    None
                                }
                            } else {
                                None
                            }
                        })
                        .collect(),
                ))
                .await?;

            self.sender
                .send(crate::message::web::WebMessage::EventList(
                    context.database.events.values().cloned().collect(),
                ))
                .await?;

            self.sender
                .send(crate::message::web::WebMessage::AlarmList(
                    context.database.data.alarms.values().cloned().collect(),
                ))
                .await?;

            self.sender
                .send(crate::message::web::WebMessage::EmailList(
                    context.database.data.emails.values().cloned().collect(),
                ))
                .await?;

            self.sender
                .send(crate::message::web::WebMessage::BackupList(
                    context.database.data.backups.iter().cloned().collect(),
                ))
                .await?;

            if let Some(alarm) = &context.alarm {
                self.sender
                    .send(crate::message::web::WebMessage::Alarm(alarm.clone()))
                    .await?;
            }

            Ok(())
        }
    }

    pub async fn process(&self, msg: crate::message::web::WebMessage) -> anyhow::Result<()> {
        match msg {
            WebMessage::LocationSet(location) => {
                let mut context = self.context.write().await;
                let location =
                    if let Some(saved) = context.database.data.locations.get_mut(&location.uuid) {
                        saved.name = location.name.clone();
                        saved.clone()
                    } else {
                        context
                            .database
                            .data
                            .locations
                            .insert(location.uuid.clone(), location.clone());
                        location
                    };

                context
                    .web_broadcast
                    .send(WebMessage::LocationDetail(location.clone()))?;
                Ok(())
            }

            WebMessage::LocationRemove(uuid) => {
                let mut context = self.context.write().await;
                context.database.data.locations.remove(&uuid);
                context
                    .web_broadcast
                    .send(crate::message::web::WebMessage::LocationRemoved(uuid))?;

                Ok(())
            }
            WebMessage::RoomSet(room) => {
                let mut context = self.context.write().await;
                let room = if let Some(saved) = context.database.data.rooms.get_mut(&room.uuid) {
                    saved.name = room.name.clone();
                    saved.location = room.location.clone();
                    saved.clone()
                } else {
                    context
                        .database
                        .data
                        .rooms
                        .insert(room.uuid.clone(), room.clone());
                    room
                };

                context
                    .web_broadcast
                    .send(WebMessage::RoomDetail(room.clone()))?;
                Ok(())
            }

            WebMessage::RoomRemove(uuid) => {
                let mut context: tokio::sync::RwLockWriteGuard<'_, crate::context::Context> =
                    self.context.write().await;
                context.database.data.rooms.remove(&uuid);
                context
                    .web_broadcast
                    .send(crate::message::web::WebMessage::RoomRemoved(uuid))?;

                Ok(())
            }
            WebMessage::ScannerSet(scanner) => {
                let mut context = self.context.write().await;
                let scanner: crate::database::entities::Scanner =
                    if let Some(saved) = context.database.data.scanners.get_mut(&scanner.uuid) {
                        saved.name = scanner.name.clone();
                        saved.room = scanner.room.clone();
                        saved.buzzer = scanner.buzzer;
                        saved.led = scanner.led;
                        saved.scan = scanner.scan;
                        saved.clone()
                    } else {
                        context
                            .database
                            .data
                            .scanners
                            .insert(scanner.uuid, scanner.clone());
                        scanner
                    };

                // Send new config to scanner
                context
                    .scanner_sender
                    .send(ScannerEvent {
                        scanner: Some(scanner.uuid),
                        message: ScannerMessage {
                            uuid: uuid::Uuid::new_v4(),
                            content: shared::messages::scanner::ScannerContent::Set(State {
                                scan: Some(scanner.scan),
                                buzzer: Some(scanner.buzzer),
                                led: Some(scanner.led),
                            }),
                        },
                    })
                    .await?;

                context
                    .web_broadcast
                    .send(WebMessage::ScannerDetail(scanner.clone()))?;

                Ok(())
            }
            WebMessage::ScannerRemove(uuid) => {
                let mut context = self.context.write().await;
                context.database.data.scanners.remove(&uuid);
                context
                    .web_broadcast
                    .send(crate::message::web::WebMessage::ScannerRemoved(uuid))?;

                Ok(())
            }
            WebMessage::DeviceSet(device) => {
                let mut context = self.context.write().await;
                let web_broadcast = context.web_broadcast.clone();
                if let Some(saved) = context.database.data.devices.get_mut(&device.uuid) {
                    saved.name = device.name.clone();
                    saved.enabled = device.enabled;

                    web_broadcast.send(WebMessage::DeviceDetail(saved.clone()))?;
                }

                Ok(())
            }
            WebMessage::DeviceRemove(uuid) => {
                let mut context = self.context.write().await;
                context.database.data.devices.remove(&uuid);
                context
                    .web_broadcast
                    .send(crate::message::web::WebMessage::DeviceRemoved(uuid))?;

                Ok(())
            }

            WebMessage::EventRemove(uuid) => {
                let mut context = self.context.write().await;
                context.database.events.remove(&uuid);
                context
                    .web_broadcast
                    .send(crate::message::web::WebMessage::EventRemoved(uuid))?;

                Ok(())
            }

            WebMessage::AlarmSet(alarm) => {
                let mut context = self.context.write().await;
                let web_broadcast = context.web_broadcast.clone();

                if let Some(saved) = context.database.data.alarms.get_mut(&alarm.uuid) {
                    saved.name = alarm.name;
                    saved.subject = alarm.subject;
                    saved.html = alarm.html;
                    saved.text = alarm.text;
                    saved.led = alarm.led;
                    saved.buzzer = alarm.buzzer;

                    web_broadcast.send(WebMessage::AlarmDetail(saved.clone()))?;
                } else {
                    context
                        .database
                        .data
                        .alarms
                        .insert(alarm.uuid.clone(), alarm.clone());
                    web_broadcast.send(WebMessage::AlarmDetail(alarm))?;
                }

                Ok(())
            }
            WebMessage::AlarmRemove(uuid) => {
                let mut context = self.context.write().await;
                context.database.data.alarms.remove(&uuid);
                context
                    .web_broadcast
                    .send(crate::message::web::WebMessage::AlarmRemoved(uuid))?;

                Ok(())
            }

            WebMessage::Alarm(alarm) => {
                // Set the alarm
                let mut context = self.context.write().await;
                context.alarm = Some(alarm.clone());

                context.database.data.scanners.values_mut().for_each(|s| {
                    s.buzzer = alarm.buzzer;
                    s.led = alarm.led
                });
                context
                    .scanner_sender
                    .send(ScannerEvent {
                        scanner: None,
                        message: ScannerMessage {
                            uuid: uuid::Uuid::new_v4(),
                            content: shared::messages::scanner::ScannerContent::Set(State {
                                scan: None,
                                buzzer: Some(alarm.buzzer),
                                led: Some(alarm.led),
                            }),
                        },
                    })
                    .await?;
                context
                    .web_broadcast
                    .send(WebMessage::Alarm(alarm.clone()))?;

                context.database.config.email.send_alarm(alarm).await?;

                Ok(())
            }

            WebMessage::AlarmStop(bool) => {
                let mut context = self.context.write().await;
                // Mark alarm as done
                context.alarm = None;
                // Set scanners to silent mode
                context.database.data.scanners.values_mut().for_each(|s| {
                    s.buzzer = false;
                    s.led = false;
                });
                // Send message to scanners
                context
                    .scanner_sender
                    .send(ScannerEvent {
                        scanner: None,
                        message: ScannerMessage {
                            uuid: uuid::Uuid::new_v4(),
                            content: shared::messages::scanner::ScannerContent::Set(State {
                                scan: None,
                                buzzer: Some(false),
                                led: Some(false),
                            }),
                        },
                    })
                    .await?;

                // Send message to web clients
                context
                    .web_broadcast
                    .send(crate::message::web::WebMessage::AlarmStop(bool))?;

                Ok(())
            }

            WebMessage::Email {
                subject,
                html,
                text,
            } => {
                let context = self.context.read().await;
                context
                    .database
                    .config
                    .email
                    .send(subject, html, text)
                    .await?;
                Ok(())
            }

            WebMessage::EmailSet(email) => {
                let mut context = self.context.write().await;
                let web_broadcast = context.web_broadcast.clone();
                if let Some(saved) = context.database.data.emails.get_mut(&email.uuid) {
                    saved.name = email.name;
                    saved.subject = email.subject;
                    saved.html = email.html;
                    saved.text = email.text;

                    web_broadcast.send(WebMessage::EmailDetail(saved.clone()))?;
                } else {
                    context
                        .database
                        .data
                        .emails
                        .insert(email.uuid.clone(), email.clone());

                    web_broadcast.send(WebMessage::EmailDetail(email))?;
                }

                Ok(())
            }

            WebMessage::EmailRemove(uuid) => {
                let mut context = self.context.write().await;
                context.database.data.emails.remove(&uuid);
                context
                    .web_broadcast
                    .send(crate::message::web::WebMessage::EmailRemoved(uuid))?;

                Ok(())
            }

            WebMessage::BackupRemove(path) => {
                let mut context = self.context.write().await;
                context.database.data.backups.remove(&path);
                context
                    .web_broadcast
                    .send(crate::message::web::WebMessage::BackupRemove(path))?;

                Ok(())
            }

            WebMessage::Backup(path) => {
                let mut context = self.context.write().await;
                context
                    .database
                    .data
                    .save(&context.database.config.base.data_path)?;
                context.database.backup(&path)?;

                context
                    .web_broadcast
                    .send(crate::message::web::WebMessage::Backup(path))?;

                Ok(())
            }

            WebMessage::Restore(path) => {
                {
                    let mut context = self.context.write().await;
                    context.database.restore(&path)?;
                }

                self.init().await
            }

            _ => Ok(()),
        }
    }
}
