use serde::{de, Deserialize, Serialize};
use std::{
    default,
    net::{Ipv4Addr, SocketAddrV4},
};
use uuid::Uuid;

#[derive(Default, Clone, Debug, Serialize, Deserialize, Eq, PartialEq, PartialOrd, Ord)]
pub struct State {
    pub scanning: bool,
    pub alarm: bool,
    pub services: Vec<Vec<u8>>,
}

#[derive(Default, Clone, Debug, Serialize, Deserialize, Eq, PartialEq, PartialOrd, Ord)]
pub enum Value {
    #[default]
    None,
    U64(u64),
}

#[derive(Default, Clone, Debug, Serialize, Deserialize, Eq, PartialEq, PartialOrd, Ord)]
pub struct ScanDevice {
    pub mac: Vec<u8>,
    pub name: String,
    pub rssi: i32,
    pub services: Vec<(Vec<u8>, Vec<u8>)>,
}

#[derive(Default, Clone, Debug, Serialize, Deserialize, Eq, PartialEq, PartialOrd, Ord)]
pub enum ScannerMessage {
    #[default]
    Nope,
    Ok(uuid::Uuid),
    Error(uuid::Uuid, String),

    Hello,
    Register,
    Ping(String),
    Pong(String),
    Restart,

    Set(State),
    ScanResult(ScanDevice),
}

#[derive(Clone, Debug)]
pub struct ScannerEvent {
    pub socket: SocketAddrV4,
    pub message: ScannerMessage,
    pub uuid: Uuid,
}

#[derive(Clone, Debug)]
pub struct ScannerPacket {
    pub message: ScannerMessage,
    pub uuid: uuid::Uuid,
}
