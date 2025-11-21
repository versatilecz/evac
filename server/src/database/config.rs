use std::{
    collections::HashMap,
    net::{Ipv4Addr, SocketAddrV4},
};

use crate::database::entities::{Contact, ContactKind};

use super::LoadSave;
use mail_send::{mail_builder::MessageBuilder, Credentials, SmtpClientBuilder};
use serde::{Deserialize, Serialize};
use sha2::Digest;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct Email {
    pub from: (String, String),
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
            tls: false,
            server: String::from("smtp"),
            port: 587,
            username: String::from("miksa"),
            password: String::from("password"),
        }
    }
}

impl Email {
    pub async fn send(
        &self,
        email: String,
        subject: String,
        html: String,
        text: String,
    ) -> anyhow::Result<()> {
        let message = MessageBuilder::new()
            .from((self.from.0.as_str(), self.from.1.as_str()))
            .to(vec![email])
            .subject(subject)
            .html_body(html)
            .text_body(text);

        let credentials = Credentials::new(&self.username, &self.password);

        SmtpClientBuilder::new(&self.server, self.port)
            .implicit_tls(self.tls)
            .credentials(credentials)
            .connect()
            .await?
            .send(message)
            .await?;

        Ok(())
    }
}

#[derive(Clone, Default, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct SMS {
    pub url: String,
    pub login: String,
    pub auth: String,
}

impl SMS {
    pub fn get_auth(&self, msg: &String) -> String {
        let mut context = md5::Context::new();
        context.consume(hex::encode(md5::compute(&self.auth).0));
        context.consume(&self.login);
        context.consume("send");
        context.consume(msg);

        hex::encode(context.finalize().0)
    }

    pub async fn send(&self, number: String, msg: String) -> anyhow::Result<()> {
        let client = reqwest::Client::new();
        let form: HashMap<String, String> = vec![
            (String::from("login"), self.login.clone()),
            (String::from("auth"), self.get_auth(&msg)),
            (String::from("msg"), msg.clone()),
            (String::from("msisdn"), number),
            (String::from("act"), String::from("send")),
        ]
        .into_iter()
        .collect();

        let resp = client.post(&self.url).form(&form).send().await?;
        tracing::debug!("Response: {:?}", resp.text().await);

        Ok(())
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct Base {
    pub config_path: String,
    pub data_path: String,
    pub auth_path: String,
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
            auth_path: String::new(),
            frontend_path: String::new(),
            salt: String::new(),
            query_size: 16,
            port_web: SocketAddrV4::new(Ipv4Addr::UNSPECIFIED, 3030),
            port_scanner: SocketAddrV4::new(Ipv4Addr::UNSPECIFIED, 3031),
            port_broadcast: SocketAddrV4::new(Ipv4Addr::BROADCAST, 3031),
            activity_diff: 15,
            routine: 5,
        }
    }
}

impl Base {
    pub fn get_hashed(&self, data: &str) -> String {
        let mut hasher = sha2::Sha256::new();
        hasher.update(&self.salt);
        hasher.update(data);
        hex::encode(hasher.finalize())
    }
}

#[derive(Clone, Debug, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct Setting {
    pub test: u64,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct Notification {
    pub email: Email,
    pub sms: SMS,
}

impl Notification {
    pub async fn send_notifications(
        &self,
        contact: Contact,
        email: crate::database::entities::Email,
    ) -> anyhow::Result<()> {
        match contact.kind {
            ContactKind::Email {
                email: email_contact,
            } => {
                self.email
                    .send(email_contact, email.subject, email.html, email.text)
                    .await?;
            }

            ContactKind::Sms { number } => {
                self.sms.send(number, email.text).await?;
            }
        }

        Ok(())
    }

    pub async fn send_alarm(
        &self,
        contact: Contact,
        email: crate::database::entities::Email,
        alarm: crate::message::web::AlarmInfo,
    ) -> anyhow::Result<()> {
        let replace = |text: &String, alarm: &crate::message::web::AlarmInfo| {
            text.replace("%device%", &alarm.device)
                .replace("%scanner%", &alarm.scanner)
                .replace("%location%", &alarm.location)
                .replace("%room%", &alarm.room)
        };

        let email = crate::database::entities::Email {
            html: replace(&email.html, &alarm),
            text: replace(&email.text, &alarm),
            ..email
        };

        self.send_notifications(contact, email).await
    }
}

#[derive(Clone, Debug, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct Server {
    pub base: Base,
    pub notification: Notification,
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
