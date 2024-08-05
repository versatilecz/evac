use serde::{de, Deserialize, Serialize};
use std::{
    default,
    net::{Ipv4Addr, SocketAddrV4},
};

#[derive(Default, Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub enum WebMessage {
    #[default]
    Close,

    Ping,

    Pong,
}
