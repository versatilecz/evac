use serde::{de, Deserialize, Serialize};
use std::{
    default,
    net::{Ipv4Addr, SocketAddrV4},
};
use uuid::Uuid;

#[derive(Default, Clone, Debug, Serialize, Deserialize, Eq, PartialEq, PartialOrd, Ord)]
pub struct State {
    pub scan: Option<bool>,
    pub led: Option<bool>,
    pub buzzer: Option<bool>,
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
    pub rssi: i32,
    pub data: Vec<u8>,
}

#[derive(Default, Clone, Debug, Serialize, Deserialize, Eq, PartialEq, PartialOrd, Ord)]
pub enum ScannerContent {
    #[default]
    Nope,
    Ok(uuid::Uuid),
    Error(uuid::Uuid, String),

    Hello,
    Register {
        mac: Vec<u8>,
    },
    Ping(String),
    Pong(String),
    Restart,

    Set(State),
    ScanResult(ScanDevice),
}

#[derive(Default, Debug, Clone, Serialize, Deserialize, Eq, PartialEq, PartialOrd, Ord)]
pub struct ScannerMessage {
    pub content: ScannerContent,
    pub uuid: uuid::Uuid,
}

#[derive(Default, Clone, Debug, Serialize, Deserialize, Eq, PartialEq, PartialOrd, Ord)]
pub struct ScannerEvent {
    pub scanner: Option<uuid::Uuid>,
    pub message: ScannerMessage,
}
