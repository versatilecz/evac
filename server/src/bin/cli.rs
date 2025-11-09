use ::server::database::LoadSave;
use std::collections::BTreeMap;

use clap::{Parser, Subcommand};
use tracing_subscriber::prelude::*;

#[derive(Parser)]
#[command(
    name = "myapp",
    version,
    about = "Ukázková aplikace s vnořenými příkazy"
)]
struct Args {
    #[arg(short, long)]
    config: Option<String>,

    #[command(subcommand)]
    command: Commands,
}
#[derive(Subcommand)]
enum Commands {
    #[command(subcommand)]
    Notification(NotificationMethod),
}

#[derive(Subcommand)]
enum NotificationMethod {
    /// Spustí server
    SMS {
        #[arg(short, long)]
        number: String,
        #[arg(short, long, default_value_t = String::from("Test message"))]
        message: String,
    },
    /// Zastaví server
    Email,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Setup logging
    let fmt_layer = tracing_subscriber::fmt::layer()
        .with_line_number(true)
        .with_writer(std::io::stderr);
    let filter = tracing_subscriber::filter::Targets::new()
        .with_target(env!("CARGO_PKG_NAME"), tracing::Level::TRACE)
        .with_target(env!("CARGO_BIN_NAME"), tracing::Level::TRACE);
    tracing_subscriber::registry()
        .with(fmt_layer)
        .with(filter)
        .init();

    tracing::info!(
        "Commit: {} Version: {}",
        env!("GIT_COMMIT"),
        env!("CARGO_PKG_VERSION")
    );

    let args = Args::parse();

    let config = ::server::database::config::Server::create(args.config)?;
    let data_path = config.base.data_path.clone();

    let database = ::server::database::Database {
        data: ::server::database::Data::load(&data_path)?,
        events: BTreeMap::new(),
        activities: ::server::database::entities::Activities::new(),
        config: config.clone(),
        version: String::new(),
    };

    match &args.command {
        Commands::Notification(notification) => match notification {
            NotificationMethod::Email => {
                tracing::debug!("Sending email");
            }
            NotificationMethod::SMS { number, message } => {
                tracing::debug!("Sending sms: {:?}", config.notification.sms);
                config
                    .notification
                    .sms
                    .send(number.clone(), message.clone())
                    .await?;
            }
        },
    }

    Ok(())
}
