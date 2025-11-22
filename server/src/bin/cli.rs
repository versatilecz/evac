use ::server::database::LoadSave;
use rand::random;
use server::{
    context, database,
    message::web::{AlarmInfo, WebMessage},
};
use shared::messages::scanner::{ScanDevice, ScannerMessage};
use std::{
    collections::BTreeMap,
    net::{IpAddr, Ipv4Addr, SocketAddr},
};
use uuid::uuid;

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
    Version,
    Notification(Notification),
    DevicePosition(DevicePosition),
    Test,
}

#[derive(Parser)]
pub struct Notification {
    #[arg(short, long)]
    #[arg(short, long)]
    uuid: uuid::Uuid,
    #[arg(short, long, default_value_t = String::from("Subject"))]
    subject: String,
    #[arg(short, long, default_value_t = String::from("Text"))]
    text: String,
}

#[derive(Parser)]
pub struct DevicePosition {
    #[arg(short, long)]
    device: uuid::Uuid,

    #[arg(short, long)]
    scanner: uuid::Uuid,

    #[arg(short, long, default_value_t = String::from("0201060a16d2fc4400cb01563a00"))]
    msg: String,
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
    let auth_path = config.base.data_path.clone();

    let database = ::server::database::Database {
        data: ::server::database::Data::load(&data_path)?,
        auth: ::server::database::Auth::load(&auth_path)?,
        events: BTreeMap::new(),
        activities: ::server::database::entities::Activities::new(),
        config: config.clone(),
        version: String::new(),
    };

    match &args.command {
        Commands::Version => {
            println!(
                "Version: {} commit: {}",
                env!("CARGO_PKG_VERSION"),
                env!("GIT_COMMIT")
            );
        }
        Commands::Notification(notification) => {
            if let Some(contact) = database.data.contacts.get(&notification.uuid) {
                tracing::debug!("Sending sms: {:?}", config.notification.sms);
                let email = database::entities::Email {
                    uuid: uuid::Uuid::new_v4(),
                    name: String::new(),
                    subject: notification.subject.clone(),
                    html: notification.text.clone(),
                    text: notification.text.clone(),
                };

                config
                    .notification
                    .send_notifications(contact.clone(), email)
                    .await?;
            }
        }
        Commands::DevicePosition(device_position) => {
            let socket =
                tokio::net::UdpSocket::bind(SocketAddr::new(IpAddr::V4(Ipv4Addr::UNSPECIFIED), 0))
                    .await?;
            socket
                .connect(SocketAddr::V4(config.base.port_scanner))
                .await
                .unwrap();

            if let (Some(scanner), Some(device)) = (
                database.data.scanners.get(&device_position.scanner),
                database.data.devices.get(&device_position.device),
            ) {
                let msg1 = ScannerMessage {
                    uuid: uuid::Uuid::new_v4(),
                    content: shared::messages::scanner::ScannerContent::Register {
                        mac: scanner.mac.clone(),
                    },
                };

                socket.send(&rmp_serde::to_vec(&msg1).unwrap()).await?;

                let msg2 = ScannerMessage {
                    uuid: uuid::Uuid::new_v4(),
                    content: shared::messages::scanner::ScannerContent::ScanResult(ScanDevice {
                        mac: device.mac.clone(),
                        rssi: random(),
                        data: hex::decode(&device_position.msg)?,
                    }),
                };

                socket.send(&rmp_serde::to_vec(&msg2).unwrap()).await?;

                //
                tracing::debug!("Sending scanner message!!!");
            }
        }
        Commands::Test => {
            let msg = WebMessage::Alarm(AlarmInfo {
                uuid: uuid::Uuid::new_v4(),
                alarm: database.data.alarms.keys().nth(0).unwrap().clone(),
                device: String::from("device"),
                scanner: String::from("Scanner"),
                location: String::from("Location"),
                room: String::from("room"),
            });

            tracing::debug!("{}", serde_json::to_string_pretty(&msg).unwrap());

            tracing::debug!(
                "{}",
                hex::encode(vec![2u8, 1, 6, 10, 22, 210, 252, 68, 0, 203, 1, 86, 58, 0])
            );
        }
    }

    Ok(())
}
