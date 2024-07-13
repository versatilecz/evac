use std::net::{Ipv4Addr, SocketAddrV4};

pub struct Register {
    pub mac: u64,
}

pub struct Read {
    pub mac: u64,
    pub battery: u8,
    pub button: bool,
    pub irssi: i64,
}

pub struct ScanDevice {
    pub uuid: uuid::Uuid,
    pub name: String,
    pub irssi: i64,
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
