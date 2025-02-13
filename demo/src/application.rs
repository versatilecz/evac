use std::any;

use esp32_nimble::utilities::BleUuid;
use esp_idf_svc::eth::{BlockingEth, EspEth, EthDriver, SpiEth};
use esp_idf_svc::hal::gpio::{Gpio18, Gpio19, Input, Output, PinDriver};
use esp_idf_svc::hal::spi;

pub struct Application<'a> {
    //pub button: PinDriver<'a, Gpio2, Input>,
    pub buzzer: PinDriver<'a, Gpio18, Output>,
    pub led: PinDriver<'a, Gpio19, Output>,
    pub eth: BlockingEth<EspEth<'a, SpiEth<spi::SpiDriver<'a>>>>,
    pub ip: Option<std::net::Ipv4Addr>,
    pub ip_broadcast: Option<std::net::Ipv4Addr>,
    pub server_address: Option<std::net::SocketAddr>,
    pub socket: Option<std::net::UdpSocket>,
    pub broadcast: Option<std::net::UdpSocket>,
    pub services: Vec<BleUuid>,
    pub running: bool,
    pub alarm: bool,
}

impl<'a> Application<'a> {
    fn set_broadcast(&mut self) -> anyhow::Result<()> {
        if let Some(ip_broadcast) = self.ip_broadcast {
            let socket_addr = std::net::SocketAddrV4::new(ip_broadcast, 34254);
            let mut socket = std::net::UdpSocket::bind(socket_addr)?;
            socket.set_read_timeout(Some(std::time::Duration::from_millis(10)))?;
            socket.set_broadcast(true)?;

            self.broadcast = Some(socket);
            Ok(())
        } else {
            Err(anyhow::anyhow!("Broadcast address is not set up"))
        }
    }
    pub fn process(&mut self) -> anyhow::Result<()> {
        // If broadcast is not set up
        if self.broadcast.is_none() && self.ip_broadcast.is_some() {
            self.set_broadcast()?;
        }

        if let Some(broadcast) = self.broadcast.as_ref() {
            // If there is a communication with a broadcast
            // Check for new server (hello package)
            let mut buffer: [u8; 1024] = [0u8; 1024];
            if let Ok((len, server_address)) = broadcast.recv_from(&mut buffer) {
                self.server_address = Some(server_address);

                if self.socket.is_none() {
                    let mut socket = std::net::UdpSocket::bind(server_address)?;
                    socket.set_read_timeout(Some(std::time::Duration::from_millis(10)))?;
                    self.socket = Some(socket);
                }

                if len > 0 {
                    if let Ok(msg) = rmp_serde::from_slice::<
                        shared::messages::scanner::ScannerMessage,
                    >(&buffer[0..len])
                    {
                        log::info!("{:?}", msg);
                    }
                }
            } else {
                log::error!("Problem to receive broadcast");
                self.broadcast = None;
            }
        }

        if let Some(socket) = self.socket.as_ref() {
            // If there is a communication with server
            // Check for new server message (config, ping)
        }

        // If we have communication with a server and we should scan
        if self.running && self.socket.is_some() {
            // bluetooth scan
        }

        // Alarm
        if self.alarm {
            self.buzzer.set_high();
            self.led.set_high();
        } else {
            self.buzzer.set_low();
            self.led.set_low();
        }

        Ok(())
    }
}
