use crate::{
    database::{
        config::Email,
        entities::{self, Alarm, Device, Role, User},
        LoadSave,
    },
    message::web::{Auth, UserInfo, WebMessage},
};
use anyhow::Context;
use shared::messages::scanner::{ScannerEvent, ScannerMessage, State};
use uuid::{timestamp::context, Uuid};

pub const ANONYMOUS_USERNAME: &str = "Anonymouse";

#[derive(Debug, Clone)]
pub struct Operator {
    pub uuid: uuid::Uuid,
    pub context: crate::context::ContextWrapped,
    pub sender: tokio::sync::mpsc::Sender<crate::message::web::WebMessage>,
    pub roles: Vec<crate::database::entities::Role>,
    pub username: String,
}

impl Operator {
    pub fn has_role(&self, msg: &crate::message::web::WebMessage) -> bool {
        let has_role = |roles: &[Role]| roles.iter().any(|r| self.roles.contains(r));

        match msg {
            WebMessage::Login(..)
            | WebMessage::Logout
            | WebMessage::UserInfo(..)
            | WebMessage::Ping
            | WebMessage::Pong
            | WebMessage::Close => true,

            WebMessage::Activity(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::ActivityList(..) => has_role(&[Role::Admin, Role::Service]),

            WebMessage::LocationDetail(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::LocationList(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::LocationSet(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::LocationRemove(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::LocationRemoved(..) => has_role(&[Role::Admin, Role::Service]),

            WebMessage::RoomDetail(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::RoomList(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::RoomSet(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::RoomRemove(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::RoomRemoved(..) => has_role(&[Role::Admin, Role::Service]),

            WebMessage::ScannerDetail(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::ScannerList(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::ScannerSet(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::ScannerRemove(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::ScannerRemoved(..) => has_role(&[Role::Admin, Role::Service]),

            WebMessage::DeviceDetail(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::DeviceList(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::DeviceSet(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::DeviceRemove(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::DeviceRemoved(..) => has_role(&[Role::Admin, Role::Service]),

            WebMessage::Event(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::EventList(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::EventRemove(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::EventRemoved(..) => has_role(&[Role::Admin, Role::Service]),

            WebMessage::EmailDetail(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::EmailList(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::EmailSet(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::Email { .. } => has_role(&[Role::Admin, Role::Service]),
            WebMessage::EmailRemove(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::EmailRemoved(..) => has_role(&[Role::Admin, Role::Service]),

            WebMessage::AlarmDetail(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::AlarmList(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::AlarmSet(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::Alarm { .. } => has_role(&[Role::Admin, Role::Service]),
            WebMessage::AlarmStop(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::AlarmRemove(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::AlarmRemoved(..) => has_role(&[Role::Admin, Role::Service]),

            WebMessage::ContactDetail(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::ContactList(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::ContactSet(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::ContactRemove(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::ContactRemoved(..) => has_role(&[Role::Admin, Role::Service]),

            WebMessage::ContactGroupDetail(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::ContactGroupList(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::ContactGroupSet(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::ContactGroupRemove(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::ContactGroupRemoved(..) => has_role(&[Role::Admin, Role::Service]),

            WebMessage::UserDetail(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::UserList(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::UserSet(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::UserRemove(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::UserRemoved(..) => has_role(&[Role::Admin, Role::Service]),

            WebMessage::TokenGet => has_role(&[Role::Admin, Role::Service]),
            WebMessage::TokenDetail(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::TokenGetForUser(..) => has_role(&[Role::Admin]),

            WebMessage::Config(..) => has_role(&[Role::Admin]),

            WebMessage::Backup(..) => has_role(&[Role::Admin]),
            WebMessage::BackupList(..) => has_role(&[Role::Admin]),
            WebMessage::BackupRemove(..) => has_role(&[Role::Admin]),
            WebMessage::Restore(..) => has_role(&[Role::Admin]),
        }
    }
    pub async fn init(&self) -> anyhow::Result<()> {
        Ok(())
    }
    pub async fn login(&self) -> anyhow::Result<()> {
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
            .send(crate::message::web::WebMessage::UserList(
                context
                    .database
                    .auth
                    .users
                    .values()
                    .map(|u| UserInfo {
                        username: u.username.clone(),
                        roles: u.roles.clone(),
                        password: None,
                    })
                    .collect(),
            ))
            .await?;

        self.sender
            .send(crate::message::web::WebMessage::ContactList(
                context.database.data.contacts.values().cloned().collect(),
            ))
            .await?;

        self.sender
            .send(crate::message::web::WebMessage::ContactGroupList(
                context
                    .database
                    .data
                    .contact_group
                    .values()
                    .cloned()
                    .collect(),
            ))
            .await?;

        self.sender
            .send(crate::message::web::WebMessage::BackupList(
                context.database.data.backups.iter().cloned().collect(),
            ))
            .await?;

        if let Some(alarm) = &context.alarm {
            self.sender
                .send(crate::message::web::WebMessage::Alarm {
                    alarm: alarm.clone(),
                    group: context.group.unwrap_or_default(),
                })
                .await?;
        }

        Ok(())
    }

    pub async fn process(&mut self, msg: crate::message::web::WebMessage) -> anyhow::Result<()> {
        match msg {
            WebMessage::Login(auth) => {
                tracing::debug!("Try to login: {:?}", auth);

                match auth {
                    Auth::Login { username, password } => {
                        if let Some(user) = self
                            .context
                            .read()
                            .await
                            .database
                            .auth
                            .users
                            .values()
                            .find(|u| u.username.eq(&username))
                            .cloned()
                        {
                            self.username = user.username.clone();
                            self.roles = user.roles.clone();

                            self.login().await?;
                        }
                    }

                    Auth::Token(token) => {
                        if let Some(token) = self
                            .context
                            .read()
                            .await
                            .database
                            .auth
                            .tokens
                            .values()
                            .find(|t| t.nonce.eq(&token))
                            .cloned()
                        {
                            if let Some(user) = self
                                .context
                                .read()
                                .await
                                .database
                                .auth
                                .users
                                .get(&token.user)
                                .cloned()
                            {
                                self.username = user.username.clone();
                                self.roles = user.roles.clone();
                                self.login().await?;
                            }
                        }
                    }
                }

                self.sender
                    .send(crate::message::web::WebMessage::UserInfo(UserInfo {
                        username: self.username.clone(),
                        roles: self.roles.clone(),
                        password: None,
                    }))
                    .await?;

                Ok(())
            }
            WebMessage::Logout => {
                self.username = String::from(ANONYMOUS_USERNAME);
                self.roles = vec![Role::Anonymous];
                Ok(())
            }

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
                    saved.email = alarm.email;
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

            WebMessage::Alarm { alarm, group } => {
                // Set the alarm
                let mut context = self.context.write().await;

                context.alarm = Some(alarm.clone());
                let contacts = context.database.data.get_contacts_by_group(group);

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
                context.web_broadcast.send(WebMessage::Alarm {
                    alarm: alarm.clone(),
                    group: group,
                })?;

                if let Some(email) = context.database.data.emails.get(&alarm.email) {
                    for contact in contacts {
                        context
                            .database
                            .config
                            .notification
                            .send_alarm(contact, email.clone(), alarm.clone())
                            .await?;
                    }
                }

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
                group,
            } => {
                let context = self.context.read().await;

                for contact in context.database.data.get_contacts_by_group(group) {
                    context
                        .database
                        .config
                        .notification
                        .send_notifications(
                            contact,
                            crate::database::entities::Email {
                                subject: subject.clone(),
                                html: html.clone(),
                                text: text.clone(),
                                ..Default::default()
                            },
                        )
                        .await?;
                    tracing::info!("Email has been send");
                }

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

            WebMessage::UserSet(user) => {
                let mut context = self.context.write().await;
                let password = user
                    .password
                    .map(|p| context.database.config.base.get_hashed(&p));

                let user_info =
                    if let Some(saved) = context.database.auth.users.get_mut(&user.username) {
                        saved.roles = user.roles;
                        if let Some(password) = password {
                            saved.password = password;
                        }

                        UserInfo {
                            username: saved.username.clone(),
                            roles: saved.roles.clone(),
                            password: None,
                        }
                    } else {
                        context.database.auth.users.insert(
                            user.username.clone(),
                            User {
                                username: user.username.clone(),
                                password: password.context("Password mus be provided")?,
                                roles: user.roles.clone(),
                            },
                        );
                        UserInfo {
                            username: user.username,
                            roles: user.roles,
                            password: None,
                        }
                    };

                context
                    .web_broadcast
                    .send(WebMessage::UserInfo(user_info))?;

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
                return self.init().await;

                Ok(())
            }

            _ => Ok(()),
        }
    }
}
