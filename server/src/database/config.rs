use std::net::{Ipv4Addr, SocketAddrV4};

use super::LoadSave;
use rand::Rng;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase", default)]
pub struct Base {
    pub config_path: String,
    pub data_path: String,
    pub frontend_path: String,
    pub salt: String,
    pub query_size: usize,
    pub port_web: SocketAddrV4,
    pub port_scanner: SocketAddrV4,
}
impl Default for Base {
    fn default() -> Self {
        Base {
            config_path: String::new(),
            data_path: String::new(),
            frontend_path: String::new(),
            salt: String::new(),
            query_size: 16,
            port_web: SocketAddrV4::new(Ipv4Addr::UNSPECIFIED, 3030),
            port_scanner: SocketAddrV4::new(Ipv4Addr::UNSPECIFIED, 3031),
        }
    }
}

#[derive(Clone, Debug, Default, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase", default)]
pub struct Setting {
    pub test: u64,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase", default)]
pub struct Server {
    pub base: Base,
    pub setting: Setting,
}
impl LoadSave for Server {}

impl Server {
    pub fn save(&self) -> anyhow::Result<()> {
        LoadSave::save(self, &self.base.config_path)
    }

    pub fn create(config_path: Option<String>) -> anyhow::Result<Server> {
        let config_path = config_path
            .unwrap_or(std::env::var("EVAC_SERVER_CONFIG").unwrap_or(String::from("config.json")));

        tracing::info!("Loading config from: {}", config_path);

        match Server::load(&config_path) {
            Ok(config) => Ok(config),
            Err(err) => {
                tracing::error!("{}", err);
                Err(anyhow::anyhow!("Cannot load config without force"))
            }
        }
    }
}
