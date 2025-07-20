use serde::{de, Deserialize, Serialize};
use std::{
    default,
    net::{Ipv4Addr, SocketAddrV4},
};

#[derive(Default, Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct Activity {
    pub device: uuid::Uuid,
    pub scanner: uuid::Uuid,
    pub rssi: i64,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Default, Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct Alarm {
    pub device: String,
    pub scanner: String,
    pub location: String,
    pub room: String,
    pub subject: String,
    pub html: String,
    pub text: String,
    pub buzzer: bool,
    pub led: bool,
}

#[derive(Default, Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub enum WebMessage {
    #[default]
    Close,

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
    Alarm(Alarm),
    AlarmStop(bool),

    Email {
        subject: String,
        html: String,
        text: String,
    },

    EmailList(Vec<crate::database::entities::Email>),
    EmailSet(crate::database::entities::Email),
    EmailDetail(crate::database::entities::Email),
    EmailRemove(uuid::Uuid),
    EmailRemoved(uuid::Uuid),

    BackupList(Vec<String>),
    BackupRemove(String),
    Backup(String),
    Restore(String),
}
