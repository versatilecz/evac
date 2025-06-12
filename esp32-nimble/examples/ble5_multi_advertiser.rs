use esp32_nimble::{
  enums::{PrimPhy, SecPhy},
  utilities::BleUuid,
  BLEAddress, BLEAddressType, BLEDevice, BLEExtAdvertisement, NimbleProperties,
};

const SERVICE_UUID: BleUuid = BleUuid::Uuid16(0xABCD);

fn main() -> anyhow::Result<()> {
  esp_idf_svc::sys::link_patches();
  esp_idf_svc::log::EspLogger::initialize_default();

  let ble_device = BLEDevice::take();

  let server = ble_device.get_server();

  let service = server.create_service(SERVICE_UUID);
  let characteristic = service
    .lock()
    .create_characteristic(BleUuid::Uuid16(0x1234), NimbleProperties::READ);
  characteristic.lock().set_value("Hello, world!".as_bytes());

  let mut ext_scannable = BLEExtAdvertisement::new(PrimPhy::Coded, SecPhy::Phy1M);
  ext_scannable.scannable(true);
  ext_scannable.connectable(false);

  ext_scannable.service_data(SERVICE_UUID, "Scan me!".as_bytes());
  ext_scannable.enable_scan_request_callback(true);

  let mut legacy_connectable = BLEExtAdvertisement::new(PrimPhy::Phy1M, SecPhy::Phy1M);
  legacy_connectable.address(&BLEAddress::from_be_bytes(
    [0xDE, 0xAD, 0xBE, 0xEF, 0xBA, 0xAD],
    BLEAddressType::Random,
  ));

  legacy_connectable.name("Legacy");
  legacy_connectable.complete_service(&SERVICE_UUID);

  legacy_connectable.legacy_advertising(true);
  legacy_connectable.connectable(true);

  let mut legacy_scan_response = BLEExtAdvertisement::new(PrimPhy::Phy1M, SecPhy::Phy1M);
  legacy_scan_response.service_data(SERVICE_UUID, "Legacy SR".as_bytes());

  {
    let mut advertising = ble_device.get_advertising().lock();
    advertising.set_instance_data(0, &mut ext_scannable)?;
    advertising.set_instance_data(1, &mut legacy_connectable)?;
    advertising.set_scan_response_data(1, &mut legacy_scan_response)?;

    advertising.start(0)?;
    advertising.start(1)?;
  }

  loop {
    esp_idf_svc::hal::delay::FreeRtos::delay_ms(5000);
  }
}
