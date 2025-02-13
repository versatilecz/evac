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

fn ping(ip: ipv4::Ipv4Addr) -> Result<(), EspError> {
    log::info!("About to do some pings for {:?}", ip);

    let ping_summary = ping::EspPing::default().ping(ip, &Default::default())?;
    if ping_summary.transmitted != ping_summary.received {
        log::warn!("Pinging IP {} resulted in timeouts", ip);
    }

    log::info!("Pinging done");

    Ok(())
}

static mut SOCKET: Option<std::net::UdpSocket> = None;

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

    let mut buzzer = PinDriver::output(pins.gpio18)?;
    buzzer.set_high();
    let mut led = PinDriver::output(pins.gpio19)?;
    led.set_high();
    //let button = PinDriver::input(pins.gpio2)?;

    let mut application = application::Application {
        buzzer,
        led,
        //  button,
        eth: eth::BlockingEth::wrap(eth, sys_loop.clone())?,
        ip: None,
        ip_broadcast: None,
        server_address: None,
        socket: None,
        broadcast: None,
        services: Vec::new(),
        running: false,
        alarm: false,
    };

    log::info!("Starting eth...");

    application.eth.start()?;

    log::info!("Waiting for DHCP lease...");

    application.eth.wait_netif_up()?;

    loop {
        // If IP address is not set
        if application.ip.is_none() || application.ip_broadcast.is_none() {
            let ip_info = application.eth.eth().netif().get_ip_info()?;

            application.ip = Some(ip_info.ip);
            application.ip_broadcast = Some(std::net::Ipv4Addr::from_bits(
                (ip_info.ip.to_bits() | (u32::MAX >> ip_info.subnet.mask.0)),
            ));

            log::info!(
                "IP address: {} broadcast: {}",
                application.ip.unwrap(),
                application.ip_broadcast.unwrap()
            );
        }

        application.process();
    }

    // Reset application
}
