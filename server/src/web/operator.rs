#[derive(Debug, Clone)]
pub struct Operator {
    pub uuid: uuid::Uuid,
    pub context: crate::context::ContextWrapped,
    pub sender: tokio::sync::mpsc::Sender<crate::message::web::WebMessage>,
}

impl Operator {
    pub async fn process(&self, msg: crate::message::web::WebMessage) -> anyhow::Result<()> {
        Ok(())
    }
}
