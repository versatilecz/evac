use serde::{de, Deserialize, Serialize};
use std::{
    default,
    net::{Ipv4Addr, SocketAddrV4},
};

#[derive(Default, Clone, Debug, Serialize, Deserialize)]
pub struct Register {
    pub mac: u64,
}

#[derive(Default, Clone, Debug, Serialize, Deserialize)]
pub enum ButtonState {
    #[default]
    Unknown,
    Single,
    Double,
    Triple,
    Long,
    Hold(u8),
}

impl From<u8> for ButtonState {
    fn from(value: u8) -> Self {
        match value {
            1 => Self::Single,
            2 => Self::Double,
            3 => Self::Triple,
            4 => Self::Long,
            254 => Self::Hold(10),
            _ => Self::Unknown,
        }
    }
}

#[derive(Default, Clone, Debug, Serialize, Deserialize)]
pub struct ScanDevice {
    pub mac: u64,
    pub name: String,
    pub rssi: i64,
    pub battery: u8,
    pub button: ButtonState,
    pub counter: u16,
}

#[derive(Default, Clone, Debug, Serialize, Deserialize)]
pub enum ScannerMessage {
    #[default]
    Nope,
    Ok(uuid::Uuid),
    Error(uuid::Uuid, String),

    Hello(SocketAddrV4),
    Welcome,
    Ping(String),
    ScanStart,
    ScanStop,
    Restart,

    Register(Register),
    Pong(String),
    ScanResult(ScanDevice),
}

#[derive(Clone, Debug)]
pub struct ScannerPacket {
    pub socket: SocketAddrV4,
    pub message: ScannerMessage,
}
