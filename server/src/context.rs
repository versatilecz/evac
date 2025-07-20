use std::{collections::BTreeMap, net::SocketAddr, os::unix::fs::chroot};

use shared::messages::{global::GlobalMessage, scanner::ScannerEvent};

use crate::{database, message::web::WebMessage};

#[derive(Debug)]
pub struct Context {
    pub global_broadcast: tokio::sync::broadcast::Sender<GlobalMessage>,
    pub web_broadcast: tokio::sync::broadcast::Sender<WebMessage>,
    pub scanner_sender: tokio::sync::mpsc::Sender<ScannerEvent>,
    pub database: crate::database::Database,
    pub alarm: Option<crate::message::web::Alarm>,
}
impl Context {
    /*
    pub fn scanner_set(&mut self, uuid: uuid::Uuid, socket: SocketAddr, mac: Vec<u8>) {
        let now = chrono::offset::Utc::now();
        if let Some(scanner) = self.database.data.scanners.get_mut(&uuid) {
            scanner.mac = mac;
            scanner.ip = socket.ip().to_string();
            scanner.last_activity = Some(now);
        } else {
            self.database.data.scanners.insert(
                uuid,
                crate::database::entities::Scanner {
                    ip: socket.ip().to_string(),
                    port: socket.port().into(),
                    last_activity: Some(now),
                    uuid: uuid,
                    room: None,
                    name: format!("Scanner: {}", hex::encode(&mac)),
                    mac: mac,
                },
            );
        }
    }
     */
}

pub type ContextWrapped = std::sync::Arc<tokio::sync::RwLock<Context>>;
