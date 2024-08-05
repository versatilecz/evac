use std::collections::BTreeMap;

use crate::{scanner, web::operator};

#[derive(Debug)]
pub struct Context {
    pub database: crate::database::Database,
    // All workers listen this events
    pub global_broadcast: tokio::sync::broadcast::Sender<shared::messages::global::GlobalMessage>,
    // All web clients listen this event
    pub web_broadcast: tokio::sync::broadcast::Sender<shared::messages::web::WebMessage>,
    // All device client listen this event
    pub scanner_broadcast:
        tokio::sync::broadcast::Sender<shared::messages::scanner::ScannerMessage>,

    pub scanner_sender: tokio::sync::mpsc::Sender<shared::messages::scanner::ScannerPacket>,

    // Device clients
    pub scanners: BTreeMap<u64, crate::scanner::Scanner>,
    // Web clients
    pub operators: BTreeMap<uuid::Uuid, crate::web::Operator>,
}
impl Context {
    pub fn operator_set(&mut self, operator: super::web::Operator) {
        tracing::debug!("Register WS client: {}", operator.uuid);
        self.operators.insert(operator.uuid, operator);
    }

    pub fn operator_rm(&mut self, uuid: &uuid::Uuid) {
        tracing::debug!("DeRegister WS client: {}", uuid);
        self.operators.remove(uuid);
    }

    pub fn scanner_set(&mut self, scanner: scanner::Scanner) {
        tracing::debug!("Register scanner: {} {}", scanner.socket, scanner.id);
        self.scanners.insert(scanner.id.clone(), scanner);
    }

    pub fn scanner_rm(&mut self, id: &u64) {
        tracing::debug!("DeRegister scanner: {}", id);
        self.scanners.remove(id);
    }
}

pub type ContextWrapped = std::sync::Arc<tokio::sync::RwLock<Context>>;
