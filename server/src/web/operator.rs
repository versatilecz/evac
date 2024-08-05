#[derive(Debug, Clone)]
pub struct Operator {
    pub uuid: uuid::Uuid,
    pub context: crate::context::ContextWrapped,
    pub sender: tokio::sync::mpsc::Sender<shared::messages::web::WebMessage>,
}

impl Operator {
    pub async fn process(&self, msg: shared::messages::web::WebMessage) -> anyhow::Result<()> {
        Ok(())
    }
}
