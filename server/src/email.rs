use mail_send::{
    mail_auth::hickory_resolver::config, mail_builder::MessageBuilder, SmtpClientBuilder,
};

use crate::context::ContextWrapped;

pub struct Email {
    pub context: ContextWrapped,
}

impl Email {
    pub async fn send(&self, device: String) -> anyhow::Result<()> {}
}
