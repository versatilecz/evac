use crate::{
    database::{
        config::Email,
        entities::{self, Alarm, Device, Role, User},
        LoadSave,
    },
    message::web::{Auth, Error, UserInfo, Version, WebMessage},
};
use anyhow::Context;
use mail_send::mail_builder::headers::content_type;
use rand::distributions::DistString;
use shared::messages::scanner::{ScannerEvent, ScannerMessage, State};
use uuid::timestamp::context;
pub const ANONYMOUS_USERNAME: &str = "Anonymous";
pub const ANONYMOUS_UUID: uuid::Uuid = uuid::Uuid::nil();

#[derive(Debug, Clone)]
pub struct Operator {
    pub uuid: uuid::Uuid,
    pub context: crate::context::ContextWrapped,
    pub sender: tokio::sync::mpsc::Sender<crate::message::web::WebMessage>,
    pub roles: Vec<crate::database::entities::Role>,
    pub username: String,
}

impl Operator {
    pub fn new(
        context: crate::context::ContextWrapped,
        sender: tokio::sync::mpsc::Sender<crate::message::web::WebMessage>,
    ) -> Self {
        Self {
            uuid: ANONYMOUS_UUID.clone(),
            context,
            sender,
            roles: vec![Role::Anonymous],
            username: String::from(ANONYMOUS_USERNAME),
        }
    }
    pub fn has_role(&self, msg: &crate::message::web::WebMessage) -> bool {
        let has_role = |roles: &[Role]| roles.iter().any(|r| self.roles.contains(r));

        match msg {
            WebMessage::Version { .. }
            | WebMessage::Login(..)
            | WebMessage::Logout
            | WebMessage::UserInfo(..)
            | WebMessage::Ping
            | WebMessage::Pong
            | WebMessage::Close
            | WebMessage::Error(..) => true,

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

            WebMessage::NotificationDetail(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::NotificationList(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::NotificationSet(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::Notify { .. } => has_role(&[Role::Admin, Role::Service]),
            WebMessage::NotificationRemove(..) => has_role(&[Role::Admin, Role::Service]),
            WebMessage::NotificationRemoved(..) => has_role(&[Role::Admin, Role::Service]),

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

            WebMessage::TokenGet(..) => has_role(&[Role::Admin, Role::Service]),
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

    pub async fn version(&self) -> anyhow::Result<()> {
        Ok(self
            .sender
            .send(WebMessage::Version(Version {
                commit: String::from(env!("GIT_COMMIT")),
                number: String::from(env!("CARGO_PKG_VERSION")),
            }))
            .await?)
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
            .send(crate::message::web::WebMessage::NotificationList(
                context
                    .database
                    .data
                    .notifications
                    .values()
                    .cloned()
                    .collect(),
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
                        uuid: u.uuid.clone(),
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

        for alarm in context.alarms.values() {
            self.sender
                .send(crate::message::web::WebMessage::Alarm(alarm.clone()))
                .await?;
        }

        Ok(())
    }

    pub async fn process(&mut self, msg: crate::message::web::WebMessage) -> anyhow::Result<()> {
        tracing::debug!("Process message: {:?}", msg);

        match &msg {
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
                            .find(|u| u.username.eq(username))
                            .cloned()
                        {
                            self.username = user.username.clone();
                            self.uuid = user.uuid.clone();
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
                            .get(token)
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
                                self.uuid = user.uuid.clone();
                                self.login().await?;
                            }
                        }
                    }
                }

                self.sender
                    .send(crate::message::web::WebMessage::UserInfo(UserInfo {
                        uuid: self.uuid.clone(),
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
                self.uuid = ANONYMOUS_UUID.clone();
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
                        location.clone()
                    };

                context
                    .web_broadcast
                    .send(WebMessage::LocationDetail(location.clone()))?;
                context
                    .database
                    .data
                    .save(&context.database.config.base.data_path)?;

                Ok(())
            }

            WebMessage::LocationRemove(uuid) => {
                let mut context = self.context.write().await;
                if !context.database.data.is_location_used(uuid) {
                    context.database.data.locations.remove(&uuid);
                    context.web_broadcast.send(
                        crate::message::web::WebMessage::LocationRemoved(uuid.clone()),
                    )?;
                    context
                        .database
                        .data
                        .save(&context.database.config.base.data_path)?;
                } else {
                    self.sender
                        .send(WebMessage::Error(Error::IntegrityError(Box::new(
                            msg.clone(),
                        ))))
                        .await?;
                    self.sender.send(WebMessage::Close).await?;
                }

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
                    room.clone()
                };

                context
                    .web_broadcast
                    .send(WebMessage::RoomDetail(room.clone()))?;
                context
                    .database
                    .data
                    .save(&context.database.config.base.data_path)?;

                Ok(())
            }

            WebMessage::RoomRemove(uuid) => {
                let mut context: tokio::sync::RwLockWriteGuard<'_, crate::context::Context> =
                    self.context.write().await;
                context.database.data.rooms.remove(&uuid);
                context
                    .web_broadcast
                    .send(crate::message::web::WebMessage::RoomRemoved(uuid.clone()))?;
                context
                    .database
                    .data
                    .save(&context.database.config.base.data_path)?;

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
                        scanner.clone()
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
                context
                    .database
                    .data
                    .save(&context.database.config.base.data_path)?;
                Ok(())
            }
            WebMessage::ScannerRemove(uuid) => {
                let mut context = self.context.write().await;
                context.database.data.scanners.remove(&uuid);
                context
                    .web_broadcast
                    .send(crate::message::web::WebMessage::ScannerRemoved(
                        uuid.clone(),
                    ))?;
                context
                    .database
                    .data
                    .save(&context.database.config.base.data_path)?;

                Ok(())
            }
            WebMessage::DeviceSet(device) => {
                let mut context = self.context.write().await;
                let web_broadcast = context.web_broadcast.clone();
                if let Some(saved) = context.database.data.devices.get_mut(&device.uuid) {
                    saved.name = device.name.clone();
                    saved.enabled = device.enabled;

                    web_broadcast.send(WebMessage::DeviceDetail(saved.clone()))?;
                    context
                        .database
                        .data
                        .save(&context.database.config.base.data_path)?;
                }

                Ok(())
            }
            WebMessage::DeviceRemove(uuid) => {
                let mut context = self.context.write().await;
                context.database.data.devices.remove(&uuid);
                context
                    .web_broadcast
                    .send(crate::message::web::WebMessage::DeviceRemoved(uuid.clone()))?;
                context
                    .database
                    .data
                    .save(&context.database.config.base.data_path)?;
                Ok(())
            }

            WebMessage::EventRemove(uuid) => {
                let mut context = self.context.write().await;
                context.database.events.remove(&uuid);
                context
                    .web_broadcast
                    .send(crate::message::web::WebMessage::EventRemoved(uuid.clone()))?;

                Ok(())
            }

            WebMessage::AlarmSet(alarm) => {
                let mut context = self.context.write().await;
                let web_broadcast = context.web_broadcast.clone();

                if let Some(saved) = context.database.data.alarms.get_mut(&alarm.uuid) {
                    saved.name = alarm.name.clone();
                    saved.notification = alarm.notification;
                    saved.led = alarm.led;
                    saved.buzzer = alarm.buzzer;
                    saved.group = alarm.group;

                    web_broadcast.send(WebMessage::AlarmDetail(saved.clone()))?;
                } else {
                    context
                        .database
                        .data
                        .alarms
                        .insert(alarm.uuid.clone(), alarm.clone());
                    web_broadcast.send(WebMessage::AlarmDetail(alarm.clone()))?;
                }

                context
                    .database
                    .data
                    .save(&context.database.config.base.data_path)?;

                Ok(())
            }
            WebMessage::AlarmRemove(uuid) => {
                let mut context = self.context.write().await;
                context.database.data.alarms.remove(&uuid);
                context
                    .web_broadcast
                    .send(crate::message::web::WebMessage::AlarmRemoved(uuid.clone()))?;
                context
                    .database
                    .data
                    .save(&context.database.config.base.data_path)?;
                Ok(())
            }

            WebMessage::Alarm(info) => {
                // Set the alarm
                let mut context = self.context.write().await;
                let alarm = context
                    .database
                    .data
                    .alarms
                    .get(&info.alarm)
                    .cloned()
                    .context("Alarm does not exist")?;
                let notification = context
                    .database
                    .data
                    .notifications
                    .get(&alarm.notification)
                    .cloned()
                    .context("Email does not exist")?;

                context.alarms.insert(info.uuid, info.clone());

                let contacts = context.database.data.get_contacts_by_group(alarm.group);

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
                    .send(WebMessage::Alarm(info.clone()))?;

                for contact in contacts {
                    context
                        .database
                        .config
                        .notification
                        .send_alarm(contact, notification.clone(), info.clone())
                        .await?;
                }

                Ok(())
            }

            WebMessage::AlarmStop(alarm) => {
                let mut context = self.context.write().await;
                // Mark alarm as done
                context.alarms.remove(&alarm);
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
                    .send(crate::message::web::WebMessage::AlarmStop(alarm.clone()))?;

                Ok(())
            }

            WebMessage::Notify { uuid, group } => {
                let context = self.context.read().await;
                if let Some(notification) = context.database.data.notifications.get(uuid).cloned() {
                    for contact in context.database.data.get_contacts_by_group(group.clone()) {
                        context
                            .database
                            .config
                            .notification
                            .send_notifications(contact, notification.clone())
                            .await?;
                        tracing::info!("Notification has been send");
                    }
                }
                context
                    .database
                    .data
                    .save(&context.database.config.base.data_path)?;

                Ok(())
            }

            WebMessage::NotificationSet(notification) => {
                let mut context = self.context.write().await;
                let web_broadcast = context.web_broadcast.clone();
                if let Some(saved) = context
                    .database
                    .data
                    .notifications
                    .get_mut(&notification.uuid)
                {
                    saved.name = notification.name.clone();
                    saved.subject = notification.subject.clone();
                    saved.short = notification.short.clone();
                    saved.long = notification.long.clone();

                    web_broadcast.send(WebMessage::NotificationDetail(saved.clone()))?;
                } else {
                    context
                        .database
                        .data
                        .notifications
                        .insert(notification.uuid.clone(), notification.clone());

                    web_broadcast.send(WebMessage::NotificationDetail(notification.clone()))?;
                }
                context
                    .database
                    .data
                    .save(&context.database.config.base.data_path)?;

                Ok(())
            }

            WebMessage::NotificationRemove(uuid) => {
                let mut context = self.context.write().await;
                context.database.data.notifications.remove(&uuid);
                context.web_broadcast.send(
                    crate::message::web::WebMessage::NotificationRemoved(uuid.clone()),
                )?;
                context
                    .database
                    .data
                    .save(&context.database.config.base.data_path)?;

                Ok(())
            }

            WebMessage::UserSet(user) => {
                let mut context = self.context.write().await;
                let password = user
                    .password
                    .as_ref()
                    .map(|p| context.database.config.base.get_hashed(p));

                let user_info = if let Some(saved) = context.database.auth.users.get_mut(&user.uuid)
                {
                    saved.roles = user.roles.clone();
                    if let Some(password) = password {
                        saved.password = password;
                    }

                    UserInfo {
                        uuid: saved.uuid.clone(),
                        username: saved.username.clone(),
                        roles: saved.roles.clone(),
                        password: None,
                    }
                } else {
                    context.database.auth.users.insert(
                        user.uuid.clone(),
                        User {
                            uuid: user.uuid.clone(),
                            username: user.username.clone(),
                            password: password.context("Password mus be provided")?,
                            roles: user.roles.clone(),
                        },
                    );
                    UserInfo {
                        uuid: user.uuid.clone(),
                        username: user.username.clone(),
                        roles: user.roles.clone(),
                        password: None,
                    }
                };

                context
                    .database
                    .data
                    .save(&context.database.config.base.data_path)?;

                context
                    .web_broadcast
                    .send(WebMessage::UserInfo(user_info))?;

                Ok(())
            }

            WebMessage::TokenGet(token) => {
                let mut context = self.context.write().await;

                if let Some(token) = token {
                    if let Some(token) = context.database.auth.tokens.get(token) {
                        self.sender
                            .send(WebMessage::TokenDetail(Some(token.clone())))
                            .await?;
                    } else {
                        self.sender.send(WebMessage::TokenDetail(None)).await?;
                    }
                } else {
                    let token = crate::database::entities::Token {
                        created: chrono::Utc::now(),
                        is_valid: true,
                        nonce: rand::distributions::Alphanumeric
                            .sample_string(&mut rand::thread_rng(), 16),
                        user: self.uuid.clone(),
                    };
                    context
                        .database
                        .auth
                        .tokens
                        .insert(token.nonce.clone(), token.clone());
                    self.sender
                        .send(WebMessage::TokenDetail(Some(token)))
                        .await?;
                }

                context
                    .database
                    .auth
                    .save(&context.database.config.base.auth_path)?;

                Ok(())
            }

            WebMessage::TokenGetForUser(uuid) => {
                let mut context = self.context.write().await;

                if let Some(user) = context.database.auth.users.get(&uuid).cloned() {
                    let token = crate::database::entities::Token {
                        created: chrono::Utc::now(),
                        is_valid: true,
                        nonce: rand::distributions::Alphanumeric
                            .sample_string(&mut rand::thread_rng(), 16),
                        user: user.uuid.clone(),
                    };
                    context
                        .database
                        .auth
                        .tokens
                        .insert(token.nonce.clone(), token.clone());
                    self.sender
                        .send(WebMessage::TokenDetail(Some(token)))
                        .await?;

                    context
                        .database
                        .auth
                        .save(&context.database.config.base.auth_path)?;
                }
                Ok(())
            }

            WebMessage::ContactSet(contact) => {
                let mut context = self.context.write().await;
                let web_broadcast = context.web_broadcast.clone();
                if let Some(saved) = context.database.data.contacts.get_mut(&contact.uuid) {
                    saved.name = contact.name.clone();
                    saved.kind = contact.kind.clone();

                    web_broadcast.send(WebMessage::ContactDetail(saved.clone()))?;
                } else {
                    context
                        .database
                        .data
                        .contacts
                        .insert(contact.uuid.clone(), contact.clone());

                    web_broadcast.send(WebMessage::ContactDetail(contact.clone()))?;
                }
                context
                    .database
                    .data
                    .save(&context.database.config.base.data_path)?;

                Ok(())
            }

            WebMessage::ContactRemove(uuid) => {
                let mut context = self.context.write().await;
                context.database.data.contacts.remove(&uuid);
                context
                    .web_broadcast
                    .send(crate::message::web::WebMessage::ContactRemoved(
                        uuid.clone(),
                    ))?;
                context
                    .database
                    .data
                    .save(&context.database.config.base.data_path)?;

                Ok(())
            }

            WebMessage::ContactGroupSet(contact_group) => {
                let mut context = self.context.write().await;
                let web_broadcast = context.web_broadcast.clone();
                if let Some(saved) = context
                    .database
                    .data
                    .contact_group
                    .get_mut(&contact_group.uuid)
                {
                    saved.name = contact_group.name.clone();
                    saved.contacts = contact_group.contacts.clone();

                    web_broadcast.send(WebMessage::ContactGroupDetail(saved.clone()))?;
                } else {
                    context
                        .database
                        .data
                        .contact_group
                        .insert(contact_group.uuid.clone(), contact_group.clone());

                    web_broadcast.send(WebMessage::ContactGroupDetail(contact_group.clone()))?;
                }
                context
                    .database
                    .data
                    .save(&context.database.config.base.data_path)?;

                Ok(())
            }

            WebMessage::ContactGroupRemove(uuid) => {
                let mut context = self.context.write().await;
                context.database.data.contact_group.remove(&uuid);
                context.web_broadcast.send(
                    crate::message::web::WebMessage::ContactGroupRemoved(uuid.clone()),
                )?;
                context
                    .database
                    .data
                    .save(&context.database.config.base.data_path)?;

                Ok(())
            }

            WebMessage::BackupRemove(path) => {
                let mut context = self.context.write().await;
                context.database.data.backups.remove(path);
                context
                    .web_broadcast
                    .send(crate::message::web::WebMessage::BackupRemove(path.clone()))?;

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
                    .send(crate::message::web::WebMessage::Backup(path.clone()))?;

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
