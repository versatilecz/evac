use esp32_nimble::BLEDevice;
use esp_idf_svc::hal::units::Count;
use std::io::Read;
use std::net::Ipv4Addr;

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

use log::{info, warn};

fn ping(ip: ipv4::Ipv4Addr) -> Result<(), EspError> {
    info!("About to do some pings for {:?}", ip);

    let ping_summary = ping::EspPing::default().ping(ip, &Default::default())?;
    if ping_summary.transmitted != ping_summary.received {
        warn!("Pinging IP {} resulted in timeouts", ip);
    }

    info!("Pinging done");

    Ok(())
}

fn main() -> anyhow::Result<()> {
    // It is necessary to call this function once. Otherwise some patches to the runtime
    // implemented by esp-idf-sys might not link properly. See https://github.com/esp-rs/esp-idf-template/issues/71
    esp_idf_svc::sys::link_patches();

    // Bind the log crate to the ESP Logging facilities
    esp_idf_svc::log::EspLogger::initialize_default();

    let peripherals = Peripherals::take()?;
    let pins = peripherals.pins;
    let mut led = PinDriver::output(pins.gpio5)?;
    let mut button = PinDriver::input(pins.gpio2)?;
    button.set_pull(gpio::Pull::Up)?;
    button.set_interrupt_type(gpio::InterruptType::NegEdge)?;

    let sys_loop = EspSystemEventLoop::take()?;
    let timer_service = EspTaskTimerService::new()?;

    log::info!("Hello, world! kokot");
    let mut eth = eth::EspEth::wrap(eth::EthDriver::new_spi(
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

    let ip_info = esp_idf_svc::hal::task::block_on(async {
        let mut eth = eth::AsyncEth::wrap(&mut eth, sys_loop.clone(), timer_service)?;

        info!("Starting eth...");

        eth.start().await?;

        info!("Waiting for DHCP lease...");

        eth.wait_netif_up().await?;

        let ip_info = eth.eth().netif().get_ip_info()?;

        info!("Eth DHCP info: {:?}", ip_info);

        Result::<_, EspError>::Ok(ip_info)
    })?;

    ping(ip_info.subnet.gateway)?;
    /*

    ping("192.168.1.2".parse().unwrap())?;
     */

    let socket =
        std::net::UdpSocket::bind("192.168.1.186:34254").expect("couldn't bind to address");
    socket
        .set_read_timeout(Some(std::time::Duration::from_millis(10)))
        .expect("set_read_timeout call failed");

    let a: anyhow::Result<()> = block_on(async {
        let ble_device = BLEDevice::take();
        /* */
        let ble_scan = ble_device.get_scan();
        /* start scan for ...*/
        ble_scan.start(10000).await?;

        /*periodical reading */
        loop {
            /* reading routine for button */
            let bt_button = block_on(ble_scan.active_scan(true).find_device(5000, |device| {
                /* */
                device.addr().eq(&esp32_nimble::BLEAddress::new(
                    /*filtering output by specific MAC address */
                    [0x7c, 0xc6, 0xb6, 0x73, 0xd7, 0x14], /*schell MAC address */
                    /* */
                    esp32_nimble::BLEAddressType::Public,
                    /*copy data into structure and  */
                ))
            }));
            /*print every info in button structure */
            if let Ok(Some(device)) = bt_button {
                let data = device
                    .get_service_data(esp32_nimble::utilities::BleUuid::from_uuid16(0xfcd2))
                    .unwrap()
                    .data()
                    .to_vec();
                /*
                                let counter: u16 =
                                    ((*data.get(1).unwrap() as u16) << 8) + *data.get(2).unwrap() as u16;
                */
                /*
                    let counter = u16::from_le_bytes(
                        data.iter()
                            .skip(1)
                            .take(2)
                            .cloned()
                            .collect::<Vec<u8>>()
                            .try_into()
                            .unwrap(),
                    );
                */

                let counter = data.get(2).unwrap_or(&0).clone();
                let battery = data.get(4).unwrap_or(&0).clone();
                let button = data.get(6).unwrap_or(&0).clone();

                let address = u64::from_be_bytes(
                    TryInto::<[u8; 8]>::try_into(device.addr().val().to_vec()).unwrap(),
                );
                let scan_device = shared::messages::scanner::ScanDevice {
                    mac: address,
                    button: shared::messages::scanner::ButtonState::Double,
                    ..Default::default()
                };
                info!("Scan: {:?}", scan_device);
                let msg = shared::messages::scanner::ScannerMessage::ScanResult(scan_device);

                socket
                    .send_to(&rmp_serde::to_vec(&msg).unwrap(), "192.168.1.2:4242")
                    .expect("couldn't send data");

                /*I (159181) demo: Scan: [address]: 7C:C6:B6:73:D7:14 [irssi]: -51 [data]: Iter([BLEServiceData { uuid: 0xfcd2, data: [68, 0, 20, 1, 100, 58, 1] }]) */
            }
        }

        Ok(())
    });

    let mut buf = [0; 255];
    loop {
        if let Ok((number_of_bytes, src_addr)) = socket.recv_from(&mut buf) {
            if number_of_bytes > 0 {
                info!(
                    "[{}] {:?} {:?}",
                    number_of_bytes,
                    src_addr,
                    buf.take(number_of_bytes as u64)
                );
            }
        }
        led.set_high().unwrap();
        // we are sleeping here to make sure the watchdog isn't triggered

        block_on(button.wait_for(gpio::InterruptType::NegEdge))?;

        led.set_low().unwrap();
    }
}
