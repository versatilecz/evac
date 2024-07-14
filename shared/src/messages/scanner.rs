use std::net::{Ipv4Addr, SocketAddrV4};

pub struct Register {
    pub mac: u64,
}

pub enum ButtonState {
    Unknown,
    Single,
    Double,
    Triple,
    Long(u8),
}

pub struct ScanDevice {
    pub mac: Vec<u8>,
    pub name: String,
    pub rssi: i64,
    pub battery: u8,
    pub button: ButtonState,
    pub counter: u16,
}

pub enum ScannerMessage {
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
    Read(Read),
}
