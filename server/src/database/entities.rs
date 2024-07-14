use std::net::Ipv4Addr;

use chrono::prelude::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase", default)]
pub struct Scanner {
    pub uuid: uuid::Uuid,
    pub chip_id: u64,
    pub name: String,
    pub ip: String,
    pub port: u16,
    pub last_activity: Option<DateTime<Utc>>,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase", default)]
pub struct Device {
    pub uuid: uuid::Uuid,
    pub name: String,
    pub mac: u64,
    pub enable: bool,
    pub battery: Option<u8>,
    pub last_activity: Vec<DeviceActivity>,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase", default)]
pub struct DeviceActivity {
    pub timestamp: DateTime<Utc>,
    pub scanner: uuid::Uuid,
    pub irssi: i64,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase", default)]
pub struct Location {
    pub uuid: uuid::Uuid,
    pub name: String,
    pub rooms: Vec<uuid::Uuid>,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase", default)]
pub struct Room {
    pub uuid: uuid::Uuid,
    pub name: String,
    pub points: Vec<(u64, u64)>,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase", default)]
pub struct Alarm {
    pub uuid: uuid::Uuid,
    pub timestamp: DateTime<Utc>,
    pub scanner: uuid::Uuid,
    pub device: Option<uuid::Uuid>,
    pub kind: AlarmKind,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum AlarmKind {
    #[default]
    ButtonPressed,
    Operator,
}
