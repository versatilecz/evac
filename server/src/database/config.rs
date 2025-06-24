use std::net::{Ipv4Addr, SocketAddrV4};

use super::LoadSave;
use mail_send::{mail_builder::MessageBuilder, Credentials, SmtpClientBuilder};
use rand::Rng;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct Email {
    pub from: (String, String),
    pub to: Vec<(String, String)>,
    pub tls: bool,
    pub server: String,
    pub port: u16,
    pub username: String,
    pub password: String,
}

impl Default for Email {
    fn default() -> Self {
        Self {
            from: (String::from("Evac"), String::from("evac@sc-l.eu")),
            to: vec![
                (String::from("Miksa"), String::from("miksanik@gmail.com")),
                (String::from("Evac"), String::from("evac@sc-l.eu")),
            ],
            tls: false,
            server: String::from("smtp"),
            port: 587,
            username: String::from("miksa"),
            password: String::from("password"),
        }
    }
}

impl Email {
    pub async fn send(&self, device: crate::database::entities::Device) -> anyhow::Result<()> {
        tracing::debug!("{:?}", self);
        let message = MessageBuilder::new()
            .from((self.from.0.as_str(), self.from.1.as_str()))
            .to(self
                .to
                .iter()
                .map(|to| (to.0.as_str(), to.1.as_str()))
                .collect::<Vec<(&str, &str)>>())
            .subject("Hi!")
            .html_body("<h1>There is a alarm in the building!</h1>")
            .text_body("There is a alarm in the building!!");

        let credentials = Credentials::new(&self.username, &self.password);

        SmtpClientBuilder::new(&self.server, self.port)
            .implicit_tls(self.tls)
            .credentials(credentials)
            .connect()
            .await
            .unwrap()
            .send(message)
            .await
            .unwrap();

        Ok(())
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct Base {
    pub config_path: String,
    pub data_path: String,
    pub frontend_path: String,
    pub salt: String,
    pub query_size: usize,
    pub activity_diff: i64,
    pub routine: i64,
    pub port_web: SocketAddrV4,
    pub port_scanner: SocketAddrV4,
    pub port_broadcast: SocketAddrV4,
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
            port_broadcast: SocketAddrV4::new(Ipv4Addr::BROADCAST, 3031),
            activity_diff: 5,
            routine: 5,
        }
    }
}

#[derive(Clone, Debug, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct Setting {
    pub test: u64,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct Server {
    pub base: Base,
    pub email: Email,
    pub setting: Setting,
}
impl LoadSave for Server {}

impl Server {
    pub fn save(&self) -> anyhow::Result<()> {
        LoadSave::save(self, &self.base.config_path)
    }

    pub fn create(config_path: Option<String>) -> anyhow::Result<Server> {
        let config_path = config_path.unwrap_or(
            std::env::var("EVAC_SERVER_CONFIG").unwrap_or(String::from("../data/server.json")),
        );

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
