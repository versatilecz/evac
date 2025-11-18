use anyhow::Context;
use chrono::{DateTime, Utc};

use serde::{de::DeserializeOwned, Deserialize, Serialize};
use std::collections::{BTreeMap, HashSet};

use crate::database::entities::{Activities, Alarm, Contact, EventKind};

pub mod config;
pub mod entities;

pub trait LoadSave {
    fn load(path: &str) -> anyhow::Result<Self>
    where
        Self: Sized + serde::de::DeserializeOwned,
    {
        crate::util::json_load::<Self>(path)
    }

    fn save(&self, path: &str) -> anyhow::Result<()>
    where
        Self: Sized + serde::Serialize,
    {
        crate::util::json_save(path, self)
    }
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct Auth {
    pub users: BTreeMap<String, entities::User>,
    pub tokens: BTreeMap<String, entities::Token>,
}

impl LoadSave for Auth {}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct Data {
    pub scanners: BTreeMap<uuid::Uuid, entities::Scanner>,
    pub devices: BTreeMap<uuid::Uuid, entities::Device>,
    pub locations: BTreeMap<uuid::Uuid, entities::Location>,
    pub rooms: BTreeMap<uuid::Uuid, entities::Room>,
    pub alarms: BTreeMap<uuid::Uuid, Alarm>,
    pub emails: BTreeMap<uuid::Uuid, entities::Email>,
    pub contacts: BTreeMap<uuid::Uuid, entities::Contact>,
    pub contact_group: BTreeMap<uuid::Uuid, entities::ContactGroup>,

    pub backups: HashSet<String>,
}

impl Default for Data {
    fn default() -> Self {
        let now = chrono::offset::Utc::now();
        let location1 = uuid::Uuid::new_v4();
        let location2 = uuid::Uuid::new_v4();
        let room1 = uuid::Uuid::new_v4();
        let room2 = uuid::Uuid::new_v4();
        let room3 = uuid::Uuid::new_v4();
        let room4 = uuid::Uuid::new_v4();
        let scanner1 = uuid::Uuid::new_v4();
        let scanner2 = uuid::Uuid::new_v4();
        let scanner3 = uuid::Uuid::new_v4();
        let scanner4 = uuid::Uuid::new_v4();
        let scanner5 = uuid::Uuid::new_v4();
        let scanner6 = uuid::Uuid::new_v4();
        let scanner7 = uuid::Uuid::new_v4();
        let scanner8 = uuid::Uuid::new_v4();
        let device1 = uuid::Uuid::new_v4();
        let device2 = uuid::Uuid::new_v4();

        Data {
            locations: BTreeMap::from_iter(vec![
                (
                    location1.clone(),
                    crate::database::entities::Location {
                        name: String::from("Location1"),
                        uuid: location1.clone(),
                    },
                ),
                (
                    location2.clone(),
                    crate::database::entities::Location {
                        name: String::from("Location2"),
                        uuid: location2.clone(),
                    },
                ),
            ]),
            rooms: BTreeMap::from_iter(vec![
                (
                    room1,
                    crate::database::entities::Room {
                        name: String::from("Room1"),
                        points: vec![(1, 1)],
                        location: location1,
                        uuid: room1,
                    },
                ),
                (
                    room2,
                    crate::database::entities::Room {
                        name: String::from("Room2"),
                        points: vec![(1, 1)],
                        location: location1,
                        uuid: room2,
                    },
                ),
                (
                    room3,
                    crate::database::entities::Room {
                        name: String::from("Room3"),
                        points: vec![(1, 1)],
                        location: location2,
                        uuid: room3,
                    },
                ),
                (
                    room4,
                    crate::database::entities::Room {
                        name: String::from("Room4"),
                        points: vec![(1, 1)],
                        location: location2,
                        uuid: room4,
                    },
                ),
            ]),
            scanners: BTreeMap::from_iter(vec![
                (
                    scanner1.clone(),
                    crate::database::entities::Scanner {
                        ip: String::from("192.168.11.1"),
                        port: 5465,
                        uuid: scanner1.clone(),
                        name: String::from("Scanner 1"),
                        mac: vec![1, 2, 3, 4],
                        last_activity: now,
                        room: Some(room1),
                        ..Default::default()
                    },
                ),
                (
                    scanner2.clone(),
                    crate::database::entities::Scanner {
                        ip: String::from("192.168.11.2"),
                        port: 5465,
                        uuid: scanner2.clone(),
                        name: String::from("Scanner 2"),
                        mac: vec![2, 2, 3, 4],
                        last_activity: now,
                        room: Some(room1),
                        ..Default::default()
                    },
                ),
                (
                    scanner3.clone(),
                    crate::database::entities::Scanner {
                        ip: String::from("192.168.11.3"),
                        port: 5465,
                        uuid: scanner3.clone(),
                        name: String::from("Scanner 3"),
                        mac: vec![3, 2, 3, 4],
                        last_activity: now,
                        room: Some(room2),
                        ..Default::default()
                    },
                ),
                (
                    scanner4.clone(),
                    crate::database::entities::Scanner {
                        ip: String::from("192.168.11.4"),
                        port: 5465,
                        uuid: scanner4.clone(),
                        name: String::from("Scanner 4"),
                        mac: vec![4, 2, 3, 4],
                        last_activity: now,
                        room: Some(room2),
                        ..Default::default()
                    },
                ),
                (
                    scanner5.clone(),
                    crate::database::entities::Scanner {
                        ip: String::from("192.168.1.5"),
                        port: 5465,
                        uuid: scanner5.clone(),
                        name: String::from("Scanner 5"),
                        mac: vec![5, 2, 3, 4],
                        last_activity: now,
                        room: Some(room3),
                        ..Default::default()
                    },
                ),
                (
                    scanner6.clone(),
                    crate::database::entities::Scanner {
                        ip: String::from("192.168.1.6"),
                        port: 5465,
                        uuid: scanner6.clone(),
                        name: String::from("Scanner 6"),
                        mac: vec![6, 2, 3, 4],
                        last_activity: now,
                        room: Some(room3),
                        ..Default::default()
                    },
                ),
                (
                    scanner7.clone(),
                    crate::database::entities::Scanner {
                        ip: String::from("192.168.1.7"),
                        port: 5465,
                        uuid: scanner7.clone(),
                        name: String::from("Scanner 7"),
                        mac: vec![7, 2, 3, 4],
                        last_activity: now,
                        room: Some(room4),
                        ..Default::default()
                    },
                ),
                (
                    scanner8.clone(),
                    crate::database::entities::Scanner {
                        ip: String::from("192.168.1.8"),
                        port: 5465,
                        uuid: scanner8.clone(),
                        name: String::from("Scanner 8"),
                        mac: vec![8, 2, 3, 4],
                        last_activity: now,
                        room: Some(room4),
                        ..Default::default()
                    },
                ),
            ]),
            devices: BTreeMap::from_iter(vec![
                (
                    device1.clone(),
                    crate::database::entities::Device {
                        battery: None,
                        uuid: device1.clone(),
                        enabled: true,
                        name: Some(String::from("Device1")),
                        last_activity: now,
                        mac: vec![1, 3, 4],
                        ..Default::default()
                    },
                ),
                (
                    device2.clone(),
                    crate::database::entities::Device {
                        battery: None,
                        uuid: device2.clone(),
                        enabled: true,
                        name: Some(String::from("Device2")),
                        last_activity: now,
                        mac: vec![2, 3, 4],
                        ..Default::default()
                    },
                ),
            ]),
            alarms: BTreeMap::new(),
            emails: BTreeMap::new(),
            contacts: BTreeMap::new(),
            contact_group: BTreeMap::new(),
            backups: HashSet::new(),
        }
    }
}

impl LoadSave for Data {}

impl Data {
    pub fn get_contacts_by_group(&self, group: uuid::Uuid) -> Vec<Contact> {
        let contacts = self
            .contact_group
            .get(&group)
            .map(|g| g.contacts.clone())
            .unwrap_or_default();

        self.contacts
            .values()
            .filter(|c| contacts.contains(&c.uuid))
            .cloned()
            .collect()
    }
}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase", default)]
pub struct Database {
    pub config: config::Server,
    pub data: Data,
    pub auth: Auth,
    pub events: BTreeMap<uuid::Uuid, entities::Event>,
    pub activities: entities::Activities,
    pub version: String,
}

impl LoadSave for Database {}

impl Database {
    pub fn backup(&mut self, path: &str) -> anyhow::Result<()> {
        self.data.backups.insert(path.into());
        self.data.save(path)
    }

    pub fn restore(&mut self, path: &str) -> anyhow::Result<()> {
        self.data = Data::load(path)?;
        Ok(())
    }
}
