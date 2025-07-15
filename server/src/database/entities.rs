use std::net::Ipv4Addr;

use chrono::prelude::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct Scanner {
    pub uuid: uuid::Uuid,
    pub name: String,
    pub ip: String,
    pub port: u16,
    pub mac: Vec<u8>,
    pub room: Option<uuid::Uuid>,
    pub last_activity: Option<DateTime<Utc>>,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct Device {
    pub uuid: uuid::Uuid,
    pub name: Option<String>,
    pub mac: Vec<u8>,
    pub enable: bool,
    pub battery: Option<u8>,
    pub activities: Vec<DeviceActivity>,
    pub last_activity: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct DeviceActivity {
    pub timestamp: DateTime<Utc>,
    pub scanner: uuid::Uuid,
    pub irssi: i64,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct Location {
    pub uuid: uuid::Uuid,
    pub name: String,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct Room {
    pub uuid: uuid::Uuid,
    pub name: String,
    pub location: uuid::Uuid,
    pub points: Vec<(u64, u64)>,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct Event {
    pub uuid: uuid::Uuid,
    pub timestamp: DateTime<Utc>,
    pub scanner: uuid::Uuid,
    pub device: Option<uuid::Uuid>,
    pub kind: EventKind,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum EventKind {
    #[default]
    Advertisement,
    ButtonPressed,
    ButtonDoublePressed,
    ButtonTriplePressed,
    ButtonLongPressed,
    ButtonHold,
    Operator,
}
