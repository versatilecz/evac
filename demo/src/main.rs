use core::num;
use esp32_nimble::utilities::BleUuid;
use esp32_nimble::BLEDevice;
use esp_idf_svc::hal::units::Count;
use std::io::Read;
use std::net::Ipv4Addr;
use std::os::fd::{AsFd, AsRawFd, FromRawFd};

use esp_idf_svc::eth;
use esp_idf_svc::hal::spi;
use esp_idf_svc::hal::spi::SpiDriverConfig;
use esp_idf_svc::hal::task::block_on;
use esp_idf_svc::sys::EspError;
use esp_idf_svc::{
    eth::{BlockingEth, EspEth, EthDriver},
    eventloop::EspSystemEventLoop,
    hal::{
        delay::FreeRtos,
        gpio::{self, PinDriver},
        prelude::Peripherals,
        units::FromValueType,
    },
    log::EspLogger,
    timer::EspTaskTimerService,
};
use esp_idf_svc::{ipv4, ping};

mod application;
mod scanner;

use esp32_nimble::BLEScan;

pub fn ble_uuid_to_vec(uuid: BleUuid) -> Vec<u8> {
    match uuid {
        BleUuid::Uuid128(data) => data.to_vec(),
        BleUuid::Uuid32(number) => number.to_le_bytes().to_vec(),
        BleUuid::Uuid16(number) => number.to_le_bytes().to_vec(),
    }
}

fn main() -> anyhow::Result<()> {
    // It is necessary to call this function once. Otherwise some patches to the runtime
    // implemented by esp-idf-sys might not link properly. See https://github.com/esp-rs/esp-idf-template/issues/71
    esp_idf_svc::sys::link_patches();
    log::info!("BT Scanner Rev 0.1");

    log::info!("Initializing peripherals...");

    // Bind the log crate to the ESP Logging facilities
    esp_idf_svc::log::EspLogger::initialize_default();
    let peripherals = Peripherals::take()?;
    let pins = peripherals.pins;
    let sys_loop = EspSystemEventLoop::take()?;
    let timer_service = EspTaskTimerService::new()?;

    let eth = eth::EspEth::wrap(eth::EthDriver::new_spi(
        spi::SpiDriver::new(
            peripherals.spi2,
            pins.gpio7,
            pins.gpio10,
            Some(pins.gpio3),
            &spi::SpiDriverConfig::new().dma(spi::Dma::Auto(4096)),
        )?,
        pins.gpio8,
        Some(pins.gpio9),
        Some(pins.gpio6),
        // Replace with DM9051 or KSZ8851SNL if you have some of these variants
        eth::SpiEthChipset::DM9051,
        20_u32.MHz().into(),
        Some(&[0x02, 0x00, 0x00, 0x12, 0x34, 0x56]),
        None,
        sys_loop.clone(),
    )?)?;
    let mut eth = eth::BlockingEth::wrap(eth, sys_loop.clone())?;

    let mut buzzer = PinDriver::output(pins.gpio18)?;
    buzzer.set_high();
    let mut led = PinDriver::output(pins.gpio19)?;
    led.set_high();

    //let button = PinDriver::input(pins.gpio2)?;

    let mut application = application::Application {
        buzzer,
        led,
        //  button,
        ip: None,
        server_address: None,
        socket: None,
        //broadcast: None,
        services: Vec::new(),
        running: false,
        alarm: false,
        mac: Vec::new(),
    };

    log::info!("Starting eth...");

    eth.start()?;

    log::info!("Waiting for DHCP lease...");

    eth.wait_netif_up()?;

    let ip_info = eth.eth().netif().get_ip_info()?;
    application.ip = Some(ip_info.ip);
    application.mac = eth.eth().netif().get_mac().unwrap().to_vec();
    log::info!("IP address: {}", application.ip.unwrap());
    let ble_device = BLEDevice::take();
    let mut ble_scan = BLEScan::new();
    let mut application = std::sync::Arc::new(std::sync::RwLock::new(application));

    loop {
        if let Ok(mut application) = application.write() {
            application.process()?;
        }

        let scan_application = application.clone();
        block_on(
            ble_scan
                .active_scan(true)
                .filter_duplicates(true)
                .interval(1000)
                .window(99)
                .start(&ble_device, 500, move |device, data| {
                    if let Ok(mut application) = scan_application.write() {
                        let mut scan_device = shared::messages::scanner::ScanDevice {
                            mac: device.addr().as_le_bytes().to_vec(),
                            name: data.name().unwrap_or_default().to_string(),
                            rssi: device.rssi() as i32,
                            services: data
                                .service_data()
                                .iter()
                                .filter_map(|s| {
                                    Some((ble_uuid_to_vec(s.uuid), s.service_data.to_vec()))
                                })
                                /*
                                .filter(|(uuid1, _)| {
                                    application
                                        .services
                                        .iter()
                                        .find(|&uuid2| uuid1.eq(uuid2))
                                        .is_some()
                                })
                                 */
                                .collect(),
                        };

                        /*
                        if let Some(service_data) = device
                            .get_service_data(esp32_nimble::utilities::BleUuid::from_uuid16(0xfcd2))
                        {
                            scan_device
                                .services
                                .push((vec![0xfc, 0xd2], service_data.data().to_vec()));
                        }
                         */

                        application.report(scan_device);
                        //log::info!("Scan: {:?}", scan_device);
                    }

                    Some(())
                }),
        );
    }

    // Reset application
}
