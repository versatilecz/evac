use serde::{de, Deserialize, Serialize};
use std::{
    default,
    net::{Ipv4Addr, SocketAddrV4},
};
use uuid::Uuid;

use crate::database::entities::{Role, Token};

#[derive(Default, Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct Activity {
    pub device: uuid::Uuid,
    pub scanner: uuid::Uuid,
    pub rssi: i64,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Default, Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct AlarmInfo {
    pub uuid: uuid::Uuid,
    pub device: String,
    pub scanner: String,
    pub location: String,
    pub room: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub enum Auth {
    Token(String),
    Login { username: String, password: String },
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct UserInfo {
    pub username: String,
    pub uuid: uuid::Uuid,
    pub roles: Vec<Role>,
    pub password: Option<String>,
}

#[derive(Default, Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub enum WebMessage {
    #[default]
    Close,

    Login(Auth),
    Logout,
    UserInfo(UserInfo),

    Ping,

    Pong,
    Config(crate::database::config::Server),

    LocationList(Vec<crate::database::entities::Location>),
    LocationSet(crate::database::entities::Location),
    LocationDetail(crate::database::entities::Location),
    LocationRemove(uuid::Uuid),
    LocationRemoved(uuid::Uuid),

    RoomList(Vec<crate::database::entities::Room>),
    RoomSet(crate::database::entities::Room),
    RoomDetail(crate::database::entities::Room),
    RoomRemove(uuid::Uuid),
    RoomRemoved(uuid::Uuid),

    ScannerList(Vec<crate::database::entities::Scanner>),
    ScannerSet(crate::database::entities::Scanner),
    ScannerDetail(crate::database::entities::Scanner),
    ScannerRemove(uuid::Uuid),
    ScannerRemoved(uuid::Uuid),

    DeviceList(Vec<crate::database::entities::Device>),
    DeviceSet(crate::database::entities::Device),
    DeviceDetail(crate::database::entities::Device),
    DeviceRemove(uuid::Uuid),
    DeviceRemoved(uuid::Uuid),

    Activity(Activity),
    ActivityList(Vec<Activity>),

    Event(crate::database::entities::Event),
    EventList(Vec<crate::database::entities::Event>),
    EventRemove(uuid::Uuid),
    EventRemoved(uuid::Uuid),

    AlarmList(Vec<crate::database::entities::Alarm>),
    AlarmSet(crate::database::entities::Alarm),
    AlarmDetail(crate::database::entities::Alarm),
    AlarmRemove(uuid::Uuid),
    AlarmRemoved(uuid::Uuid),
    Alarm(AlarmInfo),
    AlarmStop(bool),

    Email {
        uuid: uuid::Uuid,
        group: uuid::Uuid,
    },

    EmailList(Vec<crate::database::entities::Email>),
    EmailSet(crate::database::entities::Email),
    EmailDetail(crate::database::entities::Email),
    EmailRemove(uuid::Uuid),
    EmailRemoved(uuid::Uuid),

    UserList(Vec<UserInfo>),
    UserSet(UserInfo),
    UserDetail(UserInfo),
    UserRemove(uuid::Uuid),
    UserRemoved(uuid::Uuid),

    TokenGetForUser(uuid::Uuid),
    TokenGet(Option<String>),
    TokenDetail(Option<Token>),

    ContactList(Vec<crate::database::entities::Contact>),
    ContactSet(crate::database::entities::Contact),
    ContactDetail(crate::database::entities::Contact),
    ContactRemove(uuid::Uuid),
    ContactRemoved(uuid::Uuid),

    ContactGroupList(Vec<crate::database::entities::ContactGroup>),
    ContactGroupSet(crate::database::entities::ContactGroup),
    ContactGroupDetail(crate::database::entities::ContactGroup),
    ContactGroupRemove(uuid::Uuid),
    ContactGroupRemoved(uuid::Uuid),

    BackupList(Vec<String>),
    BackupRemove(String),
    Backup(String),
    Restore(String),
}
