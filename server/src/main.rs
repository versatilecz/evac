pub mod context;
pub mod database;
pub mod scanner;
pub mod server;
pub mod util;
pub mod web;

use crate::database::LoadSave;
use clap::{builder::Str, Parser};
use std::collections::BTreeMap;

use tracing_subscriber::prelude::*;

use tokio::signal::unix::{signal, SignalKind};

#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
struct Args {
    #[arg(short, long)]
    config: Option<String>,

    #[arg(short, long, action)]
    dummy: bool,
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

    let config = crate::database::config::Server::create(args.config)?;
    tracing::info!("{}", serde_json::to_string(&config).unwrap());
    let database = crate::database::Database {
        data: crate::database::Data::load(&config.base.data_path)?,
        config: config.clone(),
        version: String::new(),
    };

    let (scanner_sender, scanner_receiver) = tokio::sync::mpsc::channel(config.base.query_size);

    // Creation of context and control structures
    let context = crate::context::Context {
        global_broadcast: tokio::sync::broadcast::Sender::new(config.base.query_size),
        web_broadcast: tokio::sync::broadcast::Sender::new(config.base.query_size),
        scanner_broadcast: tokio::sync::broadcast::Sender::new(config.base.query_size),
        scanner_sender,
        database,
        scanners: BTreeMap::new(),
        operators: BTreeMap::new(),
    };

    let global_sender = context.global_broadcast.clone();
    let _web_sender = context.web_broadcast.clone();

    let context = std::sync::Arc::new(tokio::sync::RwLock::new(context));

    // Create signals
    let mut sig_int = signal(SignalKind::interrupt())?;
    let mut sig_hub = signal(SignalKind::hangup())?;
    let mut sig_quit = signal(SignalKind::quit())?;
    let mut sig_term = signal(SignalKind::terminate())?;

    let mut server = server::Server::new(context);
    let server_future = tokio::task::spawn(async move { server.run().await });

    // Create signals
    let mut sig_int = signal(SignalKind::interrupt())?;
    let mut sig_hub = signal(SignalKind::hangup())?;
    let mut sig_quit = signal(SignalKind::quit())?;
    let mut sig_term = signal(SignalKind::terminate())?;

    loop {
        // Reactions to signals
        tokio::select! {
            _ = sig_hub.recv() => {
                global_sender.send(shared::messages::global::GlobalMessage::Reload)?;
            }
            _ = sig_int.recv() => {
                global_sender.send(shared::messages::global::GlobalMessage::Stop)?;
                break;
            }
            _ = sig_quit.recv() => {
                global_sender.send(shared::messages::global::GlobalMessage::Stop)?;
                break;
            }
            _ = sig_term.recv() => {
                global_sender.send(shared::messages::global::GlobalMessage::Stop)?;
                break;
            }
            /*
            // Example tick message to broadcast
            _ = tokio::time::sleep(std::time::Duration::from_secs(1)) => {
                if web_sender.receiver_count() > 0 {
                    web_sender.send(pos::server::message::Web::UserInfo(None))?;
                } else {
                    tracing::debug!("No connected client");
                }
            }
            */
        }
    }
    server_future.await?
}
