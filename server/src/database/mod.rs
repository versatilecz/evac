use anyhow::Context;
use chrono::{DateTime, Utc};

use serde::{de::DeserializeOwned, Deserialize, Serialize};
use std::collections::BTreeMap;

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

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase", default)]
pub struct Data {
    pub scanners: BTreeMap<uuid::Uuid, entities::Scanner>,
    pub devices: BTreeMap<uuid::Uuid, entities::Device>,
    pub locations: BTreeMap<uuid::Uuid, entities::Location>,
    pub rooms: BTreeMap<uuid::Uuid, entities::Room>,
    pub alarms: BTreeMap<uuid::Uuid, entities::Alarm>,
}

impl LoadSave for Data {}

#[derive(Debug, Default, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase", default)]
pub struct Database {
    pub config: config::Server,
    pub data: Data,
    pub version: String,
}

impl LoadSave for Database {}
