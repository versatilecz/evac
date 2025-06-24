use core::num;
use esp32_nimble::utilities::BleUuid;
use esp32_nimble::BLEDevice;
/*
use esp32_nimble::enums::OwnAddrType;
;
use esp32_nimble::BLEAdvertisedData;
use esp32_nimble::BLEAdvertisedDevice;
use esp32_nimble::BLEDevice;
use esp32_nimble::BLEScan;
 */
use esp_idf_svc::eth;
use esp_idf_svc::hal::spi;
use esp_idf_svc::hal::spi::SpiDriverConfig;
use esp_idf_svc::hal::task::block_on;
use esp_idf_svc::hal::units::Count;
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
use std::io::Read;
use std::net::Ipv4Addr;
use std::os::fd::{AsFd, AsRawFd, FromRawFd};

use core::{
    ffi::c_void,
    sync::atomic::{AtomicBool, Ordering},
};

mod application;

pub fn ble_uuid_to_vec(uuid: BleUuid) -> Vec<u8> {
    match uuid {
        BleUuid::Uuid128(data) => data.to_vec(),
        BleUuid::Uuid32(number) => number.to_le_bytes().to_vec(),
        BleUuid::Uuid16(number) => number.to_le_bytes().to_vec(),
    }
}

/*
pub static mut OWN_ADDR_TYPE: OwnAddrType = OwnAddrType::Public;
static INITIALIZED: AtomicBool = AtomicBool::new(false);
static SYNCED: AtomicBool = AtomicBool::new(false);

type CbArgType<'a> = (
    &'a mut BLEScan,
    &'a mut (dyn FnMut(&mut BLEScan, &BLEAdvertisedDevice, BLEAdvertisedData<&[u8]>)),
);

extern "C" {
    fn ble_store_config_init();
}

extern "C" fn on_sync() {
    unsafe {
        esp_idf_svc::sys::ble_hs_util_ensure_addr(0);

        esp_idf_svc::sys::esp_nofail!(esp_idf_svc::sys::ble_hs_id_infer_auto(
            0,
            core::mem::transmute::<&mut OwnAddrType, &mut u8>(&mut OWN_ADDR_TYPE) as *mut _
        ));

        let mut addr = [0; 6];

        esp_idf_svc::sys::esp_nofail!(esp_idf_svc::sys::ble_hs_id_copy_addr(
            OWN_ADDR_TYPE.into(),
            addr.as_mut_ptr(),
            core::ptr::null_mut()
        ));

        ::log::info!(
            "Device Address: {:X}:{:X}:{:X}:{:X}:{:X}:{:X}",
            addr[5],
            addr[4],
            addr[3],
            addr[2],
            addr[1],
            addr[0]
        );

        SYNCED.store(true, Ordering::Release);
    }
}

extern "C" fn on_reset(reason: i32) {
    log::info!("Resetting state; reason={}", reason);
}

extern "C" fn blecent_host_task(_: *mut c_void) {
    unsafe {
        log::info!("BLE Host Task Started");
        esp_idf_svc::sys::nimble_port_run();
        esp_idf_svc::sys::nimble_port_freertos_deinit();
    }
}

extern "C" fn handle_gap_event(
    event: *mut esp_idf_svc::sys::ble_gap_event,
    arg: *mut c_void,
) -> i32 {
    let event = unsafe { &*event };

    match event.type_ as u32 {
        esp_idf_svc::sys::BLE_GAP_EVENT_EXT_DISC | esp_idf_svc::sys::BLE_GAP_EVENT_DISC => {
            #[cfg(esp_idf_bt_nimble_ext_adv)]
            let disc = unsafe { &event.__bindgen_anon_1.ext_disc };

            #[cfg(not(esp_idf_bt_nimble_ext_adv))]
            let disc = unsafe { &event.__bindgen_anon_1.disc };
            let data =
                unsafe { core::slice::from_raw_parts(disc.data, disc.length_data as _).to_vec() };

            log::info!("{:?} {:?}", disc, data);
        }
        _ => {}
    }
    0
}

#[inline]
#[allow(unused)]
pub unsafe fn extend_lifetime_mut<'a, 'b: 'a, T: ?Sized>(r: &'a mut T) -> &'b mut T {
    core::mem::transmute::<&'a mut T, &'b mut T>(r)
}

#[inline]
#[allow(unused)]
pub const unsafe fn as_mut_ptr<T>(ptr: *const T) -> *mut T {
    ptr as *mut T
}

#[inline]
pub unsafe fn as_void_ptr<T>(r: &mut T) -> *mut ::core::ffi::c_void {
    (r as *mut T).cast()
}

#[inline]
pub unsafe fn voidp_to_ref<'a, T>(ptr: *mut core::ffi::c_void) -> &'a mut T {
    &mut *ptr.cast()
}

fn init_bluetooth() -> anyhow::Result<()> {
    unsafe {
        let result = esp_idf_svc::sys::nvs_flash_init();
        if result == esp_idf_svc::sys::ESP_ERR_NVS_NO_FREE_PAGES
            || result == esp_idf_svc::sys::ESP_ERR_NVS_NEW_VERSION_FOUND
        {
            ::log::warn!("NVS initialisation failed. Erasing NVS.");
            esp_idf_svc::sys::esp_nofail!(esp_idf_svc::sys::nvs_flash_erase());
            esp_idf_svc::sys::esp_nofail!(esp_idf_svc::sys::nvs_flash_init());
        }

        esp_idf_svc::sys::esp_bt_controller_mem_release(
            esp_idf_svc::sys::esp_bt_mode_t_ESP_BT_MODE_CLASSIC_BT,
        );

        #[cfg(esp_idf_version_major = "4")]
        esp_idf_svc::sys::esp_nofail!(esp_idf_sys::esp_nimble_hci_and_controller_init());

        esp_idf_svc::sys::nimble_port_init();

        esp_idf_svc::sys::ble_hs_cfg.sync_cb = Some(on_sync);
        esp_idf_svc::sys::ble_hs_cfg.reset_cb = Some(on_reset);

        // Set initial security capabilities
        esp_idf_svc::sys::ble_hs_cfg.sm_io_cap = esp_idf_svc::sys::BLE_HS_IO_NO_INPUT_OUTPUT as _;
        esp_idf_svc::sys::ble_hs_cfg.set_sm_bonding(0);
        esp_idf_svc::sys::ble_hs_cfg.set_sm_mitm(0);
        esp_idf_svc::sys::ble_hs_cfg.set_sm_sc(1);
        esp_idf_svc::sys::ble_hs_cfg.sm_our_key_dist = 1;
        esp_idf_svc::sys::ble_hs_cfg.sm_their_key_dist = 3;
        esp_idf_svc::sys::ble_hs_cfg.store_status_cb =
            Some(esp_idf_svc::sys::ble_store_util_status_rr);

        ble_store_config_init();

        esp_idf_svc::sys::nimble_port_freertos_init(Some(blecent_host_task));

        loop {
            let syncd = SYNCED.load(Ordering::Acquire);
            if syncd {
                break;
            }
            esp_idf_svc::sys::vPortYield();
        }
        INITIALIZED.store(true, Ordering::Release);

        let scan_params = esp_idf_svc::sys::ble_gap_disc_params {
            itvl: 0,
            window: 0,
            filter_policy: esp_idf_svc::sys::BLE_HCI_SCAN_FILT_NO_WL as _,
            ..Default::default()
        };

        esp32_nimble::ble!(esp_idf_svc::sys::ble_gap_disc(
            OWN_ADDR_TYPE as _,
            0,
            &scan_params,
            Some(handle_gap_event),
            std::ptr::null_mut(),
        ))?;

        log::info!("BLE stack initialized successfully.");
        Ok(())
    }
}

 */
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

    let mut mac = [0u8; 6];
    unsafe {
        esp_idf_svc::sys::esp_efuse_mac_get_default(mac.as_mut_ptr());
    }

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
        Some(&mac),
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
        mac: mac.to_vec(),
    };

    log::info!("Starting eth...");

    eth.start()?;

    log::info!("Waiting for DHCP lease...");

    eth.wait_netif_up()?;

    let ip_info = eth.eth().netif().get_ip_info()?;
    application.ip = Some(ip_info.ip);
    application.mac = eth.eth().netif().get_mac().unwrap().to_vec();
    log::info!("IP address: {}", application.ip.unwrap());
    let mut application = std::sync::Arc::new(std::sync::RwLock::new(application));

    let ble_device = esp32_nimble::BLEDevice::take();
    let mut ble_scan = esp32_nimble::BLEScan::new();

    ble_scan.active_scan(false); // active scanning
    ble_scan.interval(100); // 100 * 0.625ms = 62.5ms
    ble_scan.window(80); // musí být <= interval
    ble_scan.filter_duplicates(true);
    let scan_application = application.clone();
    std::thread::spawn(move || {
        loop {
            block_on(ble_scan.start(
                ble_device,
                1000, // 0 == scan forever
                |device, data| -> Option<()> {
                    if let Ok(mut application) = scan_application.write() {
                        let mut scan_device = shared::messages::scanner::ScanDevice {
                            mac: device.addr().as_be_bytes().to_vec(),
                            name: data.name().map(|n| n.to_string()),
                            rssi: device.rssi() as i32,
                            data: data.payload().to_vec(),
                        };

                        application.report(scan_device);
                    } else {
                        log::error!("Unable to lock application");
                    }

                    None
                },
            ));
        }
    });

    loop {
        if let Ok(mut application) = application.write() {
            application.process()?;
        }
        log::info!("Running main loop");
        std::thread::sleep(std::time::Duration::from_millis(500));

        //let scan_application = application.clone();
    }

    // Reset application
}
