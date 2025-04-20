use std::net::SocketAddrV4;
use std::{any, result};

use esp32_nimble::uuid128;
use esp_idf_svc::eth::{BlockingEth, EspEth, EthDriver, SpiEth};
use esp_idf_svc::hal::gpio::{Gpio18, Gpio19, Input, Output, PinDriver};
use esp_idf_svc::hal::spi;

pub struct Application<'a> {
    //pub button: PinDriver<'a, Gpio2, Input>,
    pub buzzer: PinDriver<'a, Gpio18, Output>,
    pub led: PinDriver<'a, Gpio19, Output>,
    //pub eth: BlockingEth<EspEth<'a, SpiEth<spi::SpiDriver<'a>>>>,
    pub ip: Option<std::net::Ipv4Addr>,
    pub server_address: Option<std::net::SocketAddr>,
    pub socket: Option<std::net::UdpSocket>,
    //pub broadcast: Option<std::net::UdpSocket>,
    pub services: Vec<Vec<u8>>,
    pub running: bool,
    pub alarm: bool,
}

unsafe impl<'a> Sync for Application<'a> {}

impl<'a> Application<'a> {
    pub fn process(&mut self) -> anyhow::Result<()> {
        let mut buffer: [u8; 1024] = [0u8; 1024];

        if self.socket.is_none() {
            let socket_addr = std::net::SocketAddrV4::new(self.ip.unwrap(), 34254);
            let mut socket = std::net::UdpSocket::bind(socket_addr)?;
            socket.set_read_timeout(Some(std::time::Duration::from_millis(10)))?;
            socket.set_broadcast(true)?;
            self.socket = Some(socket);
        }

        if let Some(socket) = self.socket.as_ref() {
            // If there is a communication with server
            // Check for new server message (config, ping)

            while let Ok((len, server_address)) = socket.recv_from(&mut buffer) {
                if let Ok(msg) = rmp_serde::from_slice::<shared::messages::scanner::ScannerMessage>(
                    &buffer[0..len],
                ) {
                    match msg.content {
                        shared::messages::scanner::ScannerContent::Hello => {
                            let register_msg = shared::messages::scanner::ScannerContent::Register;
                            let register_data = rmp_serde::to_vec(&register_msg)?;
                            self.server_address = Some(server_address);
                            log::info!("{:?}", msg);
                            socket.send_to(&register_data, server_address)?;
                        }

                        shared::messages::scanner::ScannerContent::Set(set) => {
                            self.alarm = set.alarm;
                            self.running = set.scanning;
                            self.services = set.services;

                            log::info!("Setting message");
                        }
                        _ => {
                            log::info!("Unexpected message: {:?}", msg);
                        }
                    }
                }
            }
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

    pub fn report(&mut self, scan_device: shared::messages::scanner::ScanDevice) {
        log::info!("Scan: {:?}", scan_device);

        if let (Some(socket), Some(server_address)) =
            (self.socket.as_ref(), self.server_address.as_ref())
        {
            let msg = shared::messages::scanner::ScannerMessage {
                content: shared::messages::scanner::ScannerContent::ScanResult(scan_device),
                uuid: uuid::Uuid::new_v4(),
            };
            let data = rmp_serde::to_vec(&msg).unwrap();
            socket.send_to(&data, server_address).unwrap();
        }
    }
}
