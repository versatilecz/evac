use std::net::SocketAddrV4;
use tokio::sync::RwLockWriteGuard;

#[derive(Debug, Clone)]
pub struct Scanner {
    pub id: u64,
    pub socket: std::net::SocketAddrV4,
    pub context: crate::context::ContextWrapped,
    pub last_activity: chrono::DateTime<chrono::Utc>,
}

impl Scanner {
    pub async fn process(
        &mut self,
        msg: shared::messages::scanner::ScannerMessage,
    ) -> anyhow::Result<()> {
        tracing::info!("{:?}", msg);
        self.last_activity = chrono::Utc::now();
        {
            let mut context = self.context.write().await;
            context.scanner_set(self.clone());
        }
        Ok(())
    }
}
