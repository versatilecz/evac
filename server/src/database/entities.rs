use std::{collections::BTreeMap, net::Ipv4Addr, os::unix::fs::chroot};

use chrono::prelude::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use shared::messages::scanner;
use uuid::Uuid;

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct Scanner {
    pub uuid: uuid::Uuid,
    pub name: String,
    pub ip: String,
    pub port: u16,
    pub mac: Vec<u8>,
    pub room: Option<uuid::Uuid>,
    pub last_activity: DateTime<Utc>,
    pub led: bool,
    pub buzzer: bool,
    pub scan: bool,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct Device {
    pub uuid: uuid::Uuid,
    pub name: Option<String>,
    pub mac: Vec<u8>,
    pub enabled: bool,
    pub battery: Option<u8>,
    pub last_activity: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct Activities {
    pub map: BTreeMap<uuid::Uuid, Vec<DeviceActivity>>,
}

impl Activities {
    pub fn new() -> Self {
        Activities {
            map: BTreeMap::new(),
        }
    }
    pub fn push(
        &mut self,
        device_uuid: uuid::Uuid,
        scanner_uuid: uuid::Uuid,
        timestamp: chrono::DateTime<chrono::Utc>,
        irssi: i64,
    ) -> bool {
        let now = chrono::offset::Utc::now();

        let best1 = self.best(device_uuid);

        // Record exists
        if !self.map.contains_key(&device_uuid) {
            self.map.insert(device_uuid, Vec::new());
        }

        if let Some(activities) = self.map.get_mut(&device_uuid) {
            // If scanner exists, replace value with the lastest result
            if let Some(activity) = activities
                .iter_mut()
                .find(|a| a.scanner_uuid == scanner_uuid)
            {
                activity.irssi = irssi;
                activity.timestamp = timestamp;
            }
            // Create a new record
            else {
                activities.push(DeviceActivity {
                    timestamp: now,
                    irssi,
                    scanner_uuid: scanner_uuid,
                });
            }
        }

        let best2 = self.best(device_uuid);

        if let (Some(best1), Some(best2)) = (best1, best2) {
            best1.scanner_uuid != best2.scanner_uuid
                || (best2.timestamp - best1.timestamp).num_seconds() > 1
        } else {
            true
        }
    }

    // Clear old records
    pub fn clear(&mut self, activity_diff: i64) {
        let now = chrono::offset::Utc::now();
        self.map = self
            .map
            .iter()
            .map(|(device_uuid, activities)| {
                (
                    device_uuid.clone(),
                    activities
                        .iter()
                        .filter_map(|activity| {
                            if (now - activity.timestamp).num_seconds() < activity_diff {
                                Some(activity.clone())
                            } else {
                                None
                            }
                        })
                        .collect::<Vec<DeviceActivity>>(),
                )
            })
            .filter(|(_, activities)| activities.len() > 0)
            .collect();
    }

    // Find the best scanner for device
    pub fn best(&self, device_uuid: uuid::Uuid) -> Option<DeviceActivity> {
        self.map
            .get(&device_uuid)
            .iter()
            .map(|activities| activities.iter())
            .flatten()
            .fold(
                None,
                |prev: Option<DeviceActivity>, item: &DeviceActivity| {
                    if let Some(prev) = prev {
                        if prev.irssi < item.irssi {
                            Some(item.clone())
                        } else {
                            Some(prev)
                        }
                    } else {
                        Some(item.clone())
                    }
                },
            )
    }
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct DeviceActivity {
    pub scanner_uuid: uuid::Uuid,
    pub timestamp: DateTime<Utc>,
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

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
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

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct Alarm {
    pub uuid: uuid::Uuid,
    pub name: String,
    pub buzzer: bool,
    pub led: bool,
    pub notification: uuid::Uuid,
    pub group: uuid::Uuid,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct Notification {
    pub uuid: uuid::Uuid,
    pub name: String,
    pub subject: String,
    pub long: String,
    pub short: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
#[serde(rename_all = "camelCase")]
pub enum ContactKind {
    Sms { number: String },
    Email { email: String },
}

impl Default for ContactKind {
    fn default() -> Self {
        ContactKind::Email {
            email: String::from("miksanik@gmail.com"),
        }
    }
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct Contact {
    pub uuid: uuid::Uuid,
    pub kind: ContactKind,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct ContactGroup {
    pub uuid: uuid::Uuid,
    pub name: String,
    pub contacts: Vec<Uuid>,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum Role {
    #[default]
    Anonymous,
    Admin,
    Service,
    External,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct User {
    pub uuid: uuid::Uuid,
    pub username: String,
    pub password: String,
    pub roles: Vec<Role>,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Token {
    pub nonce: String,
    pub user: uuid::Uuid,
    pub is_valid: bool,
    pub created: chrono::DateTime<chrono::Utc>,
}
