use serde::{de, Deserialize, Serialize};
use std::{
    default,
    net::{Ipv4Addr, SocketAddrV4},
};

#[derive(Default, Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct Position {
    pub device: uuid::Uuid,
    pub scanner: uuid::Uuid,
    pub rssi: i64,
    pub timestamp: chrono::DateTime<chrono::Utc>,
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

    Positions(Vec<Position>),
    Event(crate::database::entities::Event),

    Alarm(bool),
}
