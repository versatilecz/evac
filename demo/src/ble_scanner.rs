use core::{
    ffi::c_void,
    sync::atomic::{AtomicBool, Ordering},
};
use esp_idf_svc::sys as esp_idf_sys;
use esp_idf_sys::{esp, esp_nofail, EspError};
use once_cell::unsync::Lazy;

use bitflags::bitflags;
use esp_idf_svc::sys::*;
use num_enum::{IntoPrimitive, TryFromPrimitive};

use esp_idf_svc::sys::*;
use num_enum::TryFromPrimitive;

/// Bluetooth Device address type
#[derive(PartialEq, Eq, TryFromPrimitive)]
#[repr(u8)]
pub enum BLEAddressType {
    Public = BLE_ADDR_PUBLIC as _,
    Random = BLE_ADDR_RANDOM as _,
    PublicID = BLE_ADDR_PUBLIC_ID as _,
    RandomID = BLE_ADDR_RANDOM_ID as _,
}

#[repr(transparent)]
#[derive(Copy, Clone)]
pub struct BLEAddress {
    pub(crate) value: ble_addr_t,
}

impl BLEAddress {
    pub fn from_le_bytes(val: [u8; 6], addr_type: BLEAddressType) -> Self {
        Self {
            value: ble_addr_t {
                val,
                type_: addr_type as _,
            },
        }
    }

    pub fn from_be_bytes(mut val: [u8; 6], addr_type: BLEAddressType) -> Self {
        val.reverse();
        Self::from_le_bytes(val, addr_type)
    }

    pub fn from_str(input: &str, addr_type: BLEAddressType) -> Option<Self> {
        let mut val = [0u8; 6];

        let mut nth = 0;
        for byte in input.split([':', '-']) {
            if nth == 6 {
                return None;
            }

            val[nth] = u8::from_str_radix(byte, 16).ok()?;

            nth += 1;
        }

        if nth != 6 {
            return None;
        }

        Some(Self::from_be_bytes(val, addr_type))
    }

    /// Get the native representation of the address.
    pub fn as_le_bytes(&self) -> [u8; 6] {
        self.value.val
    }

    pub fn as_be_bytes(&self) -> [u8; 6] {
        let mut bytes = self.value.val;
        bytes.reverse();
        bytes
    }

    /// Get the address type.
    pub fn addr_type(&self) -> BLEAddressType {
        BLEAddressType::try_from(self.value.type_).unwrap()
    }
}

impl From<ble_addr_t> for BLEAddress {
    fn from(value: ble_addr_t) -> Self {
        Self { value }
    }
}

impl From<BLEAddress> for ble_addr_t {
    fn from(value: BLEAddress) -> Self {
        value.value
    }
}

impl core::fmt::Display for BLEAddress {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        write!(
            f,
            "{:02X}:{:02X}:{:02X}:{:02X}:{:02X}:{:02X}",
            self.value.val[5],
            self.value.val[4],
            self.value.val[3],
            self.value.val[2],
            self.value.val[1],
            self.value.val[0]
        )
    }
}

impl core::fmt::Debug for BLEAddress {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        let type_str = match self.value.type_ as _ {
            BLE_ADDR_RANDOM => "(random)",
            BLE_ADDR_PUBLIC_ID => "(publicID)",
            BLE_ADDR_RANDOM_ID => "(randomID)",
            _ => "",
        };
        write!(f, "{self}{type_str}")
    }
}

impl PartialEq for BLEAddress {
    fn eq(&self, other: &Self) -> bool {
        self.value.val == other.value.val
    }
}

impl Eq for BLEAddress {}

#[repr(u8)]
#[derive(Copy, Clone, PartialEq, Debug, IntoPrimitive)]
pub enum SecurityIOCap {
    /// DisplayOnly IO capability
    DisplayOnly = BLE_HS_IO_DISPLAY_ONLY as _,
    /// DisplayYesNo IO capability
    DisplayYesNo = BLE_HS_IO_DISPLAY_YESNO as _,
    /// KeyboardOnly IO capability
    KeyboardOnly = BLE_HS_IO_KEYBOARD_ONLY as _,
    /// NoInputNoOutput IO capability
    NoInputNoOutput = BLE_HS_IO_NO_INPUT_OUTPUT as _,
    /// KeyboardDisplay Only IO capability
    KeyboardDisplay = BLE_HS_IO_KEYBOARD_DISPLAY as _,
}

#[repr(u32)]
#[derive(Copy, Clone, PartialEq, Debug, TryFromPrimitive, IntoPrimitive)]
pub enum PowerLevel {
    /// Corresponding to -12dbm
    N12 = esp_power_level_t_ESP_PWR_LVL_N12 as _,
    /// Corresponding to  -9dbm
    N9 = esp_power_level_t_ESP_PWR_LVL_N9 as _,
    /// Corresponding to  -6dbm
    N6 = esp_power_level_t_ESP_PWR_LVL_N6 as _,
    /// Corresponding to  -3dbm
    N3 = esp_power_level_t_ESP_PWR_LVL_N3 as _,
    /// Corresponding to   0dbm
    N0 = esp_power_level_t_ESP_PWR_LVL_N0 as _,
    /// Corresponding to  +3dbm
    P3 = esp_power_level_t_ESP_PWR_LVL_P3 as _,
    /// Corresponding to  +6dbm
    P6 = esp_power_level_t_ESP_PWR_LVL_P6 as _,
    /// Corresponding to  +9dbm
    P9 = esp_power_level_t_ESP_PWR_LVL_P9 as _,
}

impl PowerLevel {
    pub fn to_dbm(&self) -> i8 {
        match self {
            PowerLevel::N12 => -12,
            PowerLevel::N9 => -9,
            PowerLevel::N6 => -6,
            PowerLevel::N3 => -3,
            PowerLevel::N0 => 0,
            PowerLevel::P3 => 3,
            PowerLevel::P6 => 6,
            PowerLevel::P9 => 9,
        }
    }
}

#[repr(u32)]
#[derive(Copy, Clone, PartialEq, Debug, IntoPrimitive)]
pub enum PowerType {
    /// For connection handle 0
    ConnHdl0 = esp_ble_power_type_t_ESP_BLE_PWR_TYPE_CONN_HDL0 as _,
    /// For connection handle 1
    ConnHdl1 = esp_ble_power_type_t_ESP_BLE_PWR_TYPE_CONN_HDL1 as _,
    /// For connection handle 2
    ConnHdl2 = esp_ble_power_type_t_ESP_BLE_PWR_TYPE_CONN_HDL2 as _,
    /// For connection handle 3
    ConnHdl3 = esp_ble_power_type_t_ESP_BLE_PWR_TYPE_CONN_HDL3 as _,
    /// For connection handle 4
    ConnHdl4 = esp_ble_power_type_t_ESP_BLE_PWR_TYPE_CONN_HDL4 as _,
    /// For connection handle 5
    ConnHdl5 = esp_ble_power_type_t_ESP_BLE_PWR_TYPE_CONN_HDL5 as _,
    /// For connection handle 6
    ConnHdl6 = esp_ble_power_type_t_ESP_BLE_PWR_TYPE_CONN_HDL6 as _,
    /// For connection handle 7
    ConnHdl7 = esp_ble_power_type_t_ESP_BLE_PWR_TYPE_CONN_HDL7 as _,
    /// For connection handle 8
    ConnHdl8 = esp_ble_power_type_t_ESP_BLE_PWR_TYPE_CONN_HDL8 as _,
    /// For advertising
    Advertising = esp_ble_power_type_t_ESP_BLE_PWR_TYPE_ADV as _,
    /// For scan
    Scan = esp_ble_power_type_t_ESP_BLE_PWR_TYPE_SCAN as _,
    /// For default, if not set other, it will use default value
    Default = esp_ble_power_type_t_ESP_BLE_PWR_TYPE_DEFAULT as _,
}

#[repr(u8)]
#[derive(Copy, Clone, PartialEq, Debug, IntoPrimitive)]
pub enum OwnAddrType {
    Public = BLE_OWN_ADDR_PUBLIC as _,
    Random = BLE_OWN_ADDR_RANDOM as _,
    RpaPublicDefault = BLE_OWN_ADDR_RPA_PUBLIC_DEFAULT as _,
    RpaRandomDefault = BLE_OWN_ADDR_RPA_RANDOM_DEFAULT as _,
}

#[repr(u8)]
#[derive(Copy, Clone, PartialEq, Debug)]
pub enum ConnMode {
    /// non-connectable (3.C.9.3.2)
    Non = BLE_GAP_CONN_MODE_NON as _,
    /// directed-connectable (3.C.9.3.3)
    Dir = BLE_GAP_CONN_MODE_DIR as _,
    /// undirected-connectable (3.C.9.3.4)
    Und = BLE_GAP_CONN_MODE_UND as _,
}

#[repr(u8)]
#[derive(Copy, Clone, PartialEq, Debug)]
pub enum DiscMode {
    /// non-discoverable; 3.C.9.2.2
    Non = BLE_GAP_DISC_MODE_NON as _,
    /// limited-discoverable; 3.C.9.2.3
    Ltd = BLE_GAP_DISC_MODE_LTD as _,
    /// general-discoverable; 3.C.9.2.4
    Gen = BLE_GAP_DISC_MODE_GEN as _,
}

bitflags! {
  #[repr(transparent)]
  #[derive(Debug, Clone, Copy, PartialEq, Eq)]
  pub struct PairKeyDist: u8 {
    /// Accept/Distribute the encryption key.
    const ENC = BLE_SM_PAIR_KEY_DIST_ENC as _;
    /// Accept/Distribute the ID key (IRK).
    const ID = BLE_SM_PAIR_KEY_DIST_ID as _;
    const SIGN = BLE_SM_PAIR_KEY_DIST_SIGN as _;
    const LINK = BLE_SM_PAIR_KEY_DIST_LINK as _;
  }
}

bitflags! {
  #[repr(transparent)]
  #[derive(Debug, Clone, Copy, PartialEq, Eq)]
  pub struct AuthReq: u8 {
    /// allow bounding
    const Bond = 0b001;
    /// man in the middle protection
    const Mitm = 0b010;
    /// secure connection pairing
    const Sc = 0b100;
  }
}

#[derive(Copy, Clone, PartialEq, Debug)]
pub enum AdvType {
    /// indirect advertising
    Ind,
    /// direct advertising
    DirectInd,
    /// indirect scan response
    ScanInd,
    /// indirect advertising - not connectable
    NonconnInd,
    ScanResponse,
    #[cfg(esp_idf_bt_nimble_ext_adv)]
    Extended(u8),
}

impl AdvType {
    pub(crate) fn from_event_type(event_type: u8) -> Self {
        match event_type as u32 {
            BLE_HCI_ADV_RPT_EVTYPE_ADV_IND => AdvType::Ind,
            BLE_HCI_ADV_RPT_EVTYPE_DIR_IND => AdvType::DirectInd,
            BLE_HCI_ADV_RPT_EVTYPE_SCAN_IND => AdvType::ScanInd,
            BLE_HCI_ADV_RPT_EVTYPE_NONCONN_IND => AdvType::NonconnInd,
            BLE_HCI_ADV_RPT_EVTYPE_SCAN_RSP => AdvType::ScanResponse,
            5.. => unreachable!(),
        }
    }
}

bitflags! {
  #[repr(transparent)]
  #[derive(Debug, Clone, Copy, PartialEq, Eq)]
  pub struct AdvFlag: u8 {
    /// LE Limited Discoverable Mode
    const DiscLimited = BLE_HS_ADV_F_DISC_LTD as _;
    /// LE General Discoverable Mode
    const DiscGeneral = BLE_HS_ADV_F_DISC_GEN as _;
    /// BR/EDR Not Supported
    const BrEdrUnsupported = BLE_HS_ADV_F_BREDR_UNSUP as _;
    /// Simultaneous LE and BR/EDR to Same Device Capable (Controller)
    const SimultaneousController = 0b01000;
    /// Simultaneous LE and BR/EDR to Same Device Capable (Host)
    const SimultaneousHost       = 0b10000;
  }
}

#[repr(u8)]
#[derive(Copy, Clone, PartialEq, Debug, IntoPrimitive)]
pub enum ScanFilterPolicy {
    /// Scanner processes all advertising packets (white list not used)
    /// except directed, connectable advertising packets not sent to the scanner.
    NoWl = BLE_HCI_SCAN_FILT_NO_WL as _,
    /// Scanner processes advertisements from white list only.
    /// A connectable, directed advertisement is ignored unless it contains scanners address.
    UseWl = BLE_HCI_SCAN_FILT_USE_WL as _,
    /// Scanner process all advertising packets (white list not used).
    /// A connectable, directed advertisement shall not be ignored if the InitA is a resolvable private address.
    NoWlInitA = BLE_HCI_SCAN_FILT_NO_WL_INITA as _,
    /// Scanner process advertisements from white list only.
    /// A connectable, directed advertisement shall not be ignored if the InitA is a resolvable private address.
    UseWlInitA = BLE_HCI_SCAN_FILT_USE_WL_INITA as _,
}

#[repr(u8)]
#[derive(Copy, Clone, PartialEq, Debug, IntoPrimitive)]
pub enum AdvFilterPolicy {
    /// No filtering
    None = BLE_HCI_ADV_FILT_NONE as _,
    /// only allow scan requests from those on the white list.
    Scan = BLE_HCI_ADV_FILT_SCAN as _,
    /// only allow connections from those on the white list.
    Connect = BLE_HCI_ADV_FILT_CONN as _,
    /// only allow scan/connections from those on the white list.
    Both = BLE_HCI_ADV_FILT_BOTH as _,
}

#[repr(u8)]
#[derive(Copy, Clone, PartialEq, Debug, TryFromPrimitive, IntoPrimitive)]
pub enum PrimPhy {
    /// 1Mbps phy
    Phy1M = BLE_HCI_LE_PHY_1M as _,
    /// Coded phy
    Coded = BLE_HCI_LE_PHY_CODED as _,
}

#[repr(u8)]
#[derive(Copy, Clone, PartialEq, Debug, TryFromPrimitive, IntoPrimitive)]
pub enum SecPhy {
    /// 1Mbps phy
    Phy1M = BLE_HCI_LE_PHY_1M as _,
    /// 2Mbps phy
    Phy2M = BLE_HCI_LE_PHY_2M as _,
    /// Coded phy
    Coded = BLE_HCI_LE_PHY_CODED as _,
}

extern "C" {
    fn ble_store_config_init();
}

static mut BLE_DEVICE: Lazy<BLEDevice> = Lazy::new(|| {
    BLEDevice::init();
    BLEDevice {
        security: BLESecurity::new(),
    }
});
pub static mut BLE_SERVER: Lazy<BLEServer> = Lazy::new(BLEServer::new);
static BLE_ADVERTISING: Lazy<Mutex<BLEAdvertising>> =
    Lazy::new(|| Mutex::new(BLEAdvertising::new()));

pub static mut OWN_ADDR_TYPE: OwnAddrType = OwnAddrType::Public;
static INITIALIZED: AtomicBool = AtomicBool::new(false);
static SYNCED: AtomicBool = AtomicBool::new(false);

#[cfg(not(feature = "debug"))]
macro_rules! ble {
    ($err:expr) => {{
        $crate::BLEError::convert($err as _)
    }};
}

impl BLEDevice {
    pub fn init() {
        // NVS initialisation.
        unsafe {
            let initialized = INITIALIZED.load(Ordering::Acquire);
            if !initialized {
                let result = esp_idf_sys::nvs_flash_init();
                if result == esp_idf_sys::ESP_ERR_NVS_NO_FREE_PAGES
                    || result == esp_idf_sys::ESP_ERR_NVS_NEW_VERSION_FOUND
                {
                    ::log::warn!("NVS initialisation failed. Erasing NVS.");
                    esp_nofail!(esp_idf_sys::nvs_flash_erase());
                    esp_nofail!(esp_idf_sys::nvs_flash_init());
                }

                esp_idf_sys::esp_bt_controller_mem_release(
                    esp_idf_sys::esp_bt_mode_t_ESP_BT_MODE_CLASSIC_BT,
                );

                #[cfg(esp_idf_version_major = "4")]
                esp_nofail!(esp_idf_sys::esp_nimble_hci_and_controller_init());

                esp_idf_sys::nimble_port_init();

                esp_idf_sys::ble_hs_cfg.sync_cb = Some(Self::on_sync);
                esp_idf_sys::ble_hs_cfg.reset_cb = Some(Self::on_reset);

                // Set initial security capabilities
                esp_idf_sys::ble_hs_cfg.sm_io_cap = esp_idf_sys::BLE_HS_IO_NO_INPUT_OUTPUT as _;
                esp_idf_sys::ble_hs_cfg.set_sm_bonding(0);
                esp_idf_sys::ble_hs_cfg.set_sm_mitm(0);
                esp_idf_sys::ble_hs_cfg.set_sm_sc(1);
                esp_idf_sys::ble_hs_cfg.sm_our_key_dist = 1;
                esp_idf_sys::ble_hs_cfg.sm_their_key_dist = 3;
                esp_idf_sys::ble_hs_cfg.store_status_cb =
                    Some(esp_idf_sys::ble_store_util_status_rr);

                ble_store_config_init();

                esp_idf_sys::nimble_port_freertos_init(Some(Self::blecent_host_task));
            }

            loop {
                let syncd = SYNCED.load(Ordering::Acquire);
                if syncd {
                    break;
                }
                esp_idf_sys::vPortYield();
            }
        }
    }

    pub fn take() -> &'static mut Self {
        unsafe { Lazy::force_mut(&mut BLE_DEVICE) }
    }

    /// Shutdown the NimBLE stack/controller
    pub fn deinit() -> Result<(), EspError> {
        unsafe {
            esp!(esp_idf_sys::nimble_port_stop())?;

            #[cfg(esp_idf_version_major = "4")]
            {
                esp_idf_sys::nimble_port_deinit();
                esp!(esp_idf_sys::esp_nimble_hci_and_controller_deinit())?;
            }

            #[cfg(not(esp_idf_version_major = "4"))]
            esp!(esp_idf_sys::nimble_port_deinit())?;

            INITIALIZED.store(false, Ordering::Release);
            SYNCED.store(false, Ordering::Release);

            if let Some(server) = Lazy::get_mut(&mut BLE_SERVER) {
                server.started = false;
            }
        };

        Ok(())
    }

    /// Shutdown the NimBLE stack/controller
    /// server/advertising/scan will be reset.
    pub fn deinit_full() -> Result<(), EspError> {
        Self::deinit()?;
        unsafe {
            #[cfg(not(esp_idf_bt_nimble_ext_adv))]
            if let Some(advertising) = Lazy::get(&BLE_ADVERTISING) {
                advertising.lock().reset().unwrap();
            }

            if let Some(server) = Lazy::get_mut(&mut BLE_SERVER) {
                server.reset();
            }
        }
        Ok(())
    }

    pub fn set_power(
        &mut self,
        power_type: PowerType,
        power_level: PowerLevel,
    ) -> Result<(), BLEError> {
        unsafe {
            ble!(esp_idf_sys::esp_ble_tx_power_set(
                power_type.into(),
                power_level.into()
            ))
        }
    }

    pub fn get_power(&self, power_type: PowerType) -> PowerLevel {
        PowerLevel::try_from(unsafe { esp_idf_sys::esp_ble_tx_power_get(power_type.into()) })
            .unwrap()
    }

    /// Sets the preferred ATT MTU; the device will indicate this value in all subsequent ATT MTU exchanges.
    /// The ATT MTU of a connection is equal to the lower of the two peers’preferred MTU values.
    /// The ATT MTU is what dictates the maximum size of any message sent during a GATT procedure.
    ///
    /// The specified MTU must be within the following range: [23, BLE_ATT_MTU_MAX].
    /// 23 is a minimum imposed by the Bluetooth specification;
    /// BLE_ATT_MTU_MAX is a NimBLE compile-time setting.
    pub fn set_preferred_mtu(&self, mtu: u16) -> Result<(), BLEError> {
        unsafe { ble!(esp_idf_sys::ble_att_set_preferred_mtu(mtu)) }
    }

    /// Retrieves the preferred ATT MTU.
    /// This is the value indicated by the device during an ATT MTU exchange.
    pub fn get_preferred_mtu(&self) -> u16 {
        unsafe { esp_idf_sys::ble_att_preferred_mtu() }
    }

    /// Get the addresses of all bonded peer device.
    pub fn bonded_addresses(&self) -> Result<Vec<BLEAddress>, BLEError> {
        let mut peer_id_addrs =
            [esp_idf_sys::ble_addr_t::default(); esp_idf_sys::MYNEWT_VAL_BLE_STORE_MAX_BONDS as _];
        let mut num_peers: core::ffi::c_int = 0;

        unsafe {
            ble!(esp_idf_sys::ble_store_util_bonded_peers(
                peer_id_addrs.as_mut_ptr(),
                &mut num_peers,
                esp_idf_sys::MYNEWT_VAL_BLE_STORE_MAX_BONDS as _,
            ))?
        };

        let mut result = Vec::with_capacity(esp_idf_sys::MYNEWT_VAL_BLE_STORE_MAX_BONDS as _);
        for addr in peer_id_addrs.iter().take(num_peers as _) {
            result.push(BLEAddress::from(*addr));
        }

        Ok(result)
    }

    /// Deletes all bonding information.
    pub fn delete_all_bonds(&self) -> Result<(), BLEError> {
        unsafe { ble!(esp_idf_sys::ble_store_clear()) }
    }

    /// Deletes a peer bond.
    ///
    /// * `address`: The address of the peer with which to delete bond info.
    pub fn delete_bond(&self, address: &BLEAddress) -> Result<(), BLEError> {
        unsafe { ble!(esp_idf_sys::ble_gap_unpair(&address.value)) }
    }

    pub fn set_white_list(&mut self, white_list: &[BLEAddress]) -> Result<(), BLEError> {
        unsafe {
            ble!(esp_idf_sys::ble_gap_wl_set(
                white_list.as_ptr() as _,
                white_list.len() as _
            ))
        }
    }

    pub fn security(&mut self) -> &mut BLESecurity {
        &mut self.security
    }

    pub fn get_addr(&self) -> Result<BLEAddress, BLEError> {
        let mut addr = [0; 6];

        unsafe {
            ble!(esp_idf_sys::ble_hs_id_copy_addr(
                OWN_ADDR_TYPE.into(),
                addr.as_mut_ptr(),
                core::ptr::null_mut()
            ))?;

            let addr_type = match OWN_ADDR_TYPE {
                OwnAddrType::Public => BLEAddressType::Public,
                _ => BLEAddressType::Random,
            };

            Ok(BLEAddress::from_le_bytes(addr, addr_type))
        }
    }

    /// Set the own address type.
    pub fn set_own_addr_type(&mut self, own_addr_type: OwnAddrType) {
        self._set_own_addr_type(own_addr_type, false);
    }

    #[allow(unused_variables)]
    fn _set_own_addr_type(&mut self, own_addr_type: OwnAddrType, use_nrpa: bool) {
        unsafe {
            OWN_ADDR_TYPE = own_addr_type;
            match own_addr_type {
                OwnAddrType::Public => {
                    #[cfg(esp32)]
                    ble_hs_pvcy_rpa_config(NIMBLE_HOST_DISABLE_PRIVACY);
                }
                OwnAddrType::Random => {
                    self.security().resolve_rpa();
                    #[cfg(esp32)]
                    ble_hs_pvcy_rpa_config(if use_nrpa {
                        NIMBLE_HOST_ENABLE_NRPA
                    } else {
                        NIMBLE_HOST_ENABLE_RPA
                    });
                }
                OwnAddrType::RpaPublicDefault | OwnAddrType::RpaRandomDefault => {
                    self.security().resolve_rpa();
                    #[cfg(esp32)]
                    ble_hs_pvcy_rpa_config(NIMBLE_HOST_ENABLE_RPA);
                }
            }
        }
    }

    /// Set the own address to be used when the address type is random.
    pub fn set_rnd_addr(&mut self, mut addr: [u8; 6]) -> Result<(), BLEError> {
        addr.reverse();
        unsafe { ble!(esp_idf_sys::ble_hs_id_set_rnd(addr.as_ptr())) }
    }

    #[allow(dangling_pointers_from_temporaries)]
    pub fn set_device_name(device_name: &str) -> Result<(), BLEError> {
        unsafe {
            ble!(esp_idf_sys::ble_svc_gap_device_name_set(
                CString::new(device_name).unwrap().as_ptr().cast()
            ))
        }
    }

    extern "C" fn on_sync() {
        unsafe {
            esp_idf_sys::ble_hs_util_ensure_addr(0);

            esp_nofail!(esp_idf_sys::ble_hs_id_infer_auto(
                0,
                core::mem::transmute::<&mut OwnAddrType, &mut u8>(&mut OWN_ADDR_TYPE) as *mut _
            ));

            let mut addr = [0; 6];
            esp_nofail!(esp_idf_sys::ble_hs_id_copy_addr(
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
        ::log::info!("Resetting state; reason={}", reason);
    }

    extern "C" fn blecent_host_task(_: *mut c_void) {
        unsafe {
            ::log::info!("BLE Host Task Started");
            esp_idf_sys::nimble_port_run();
            esp_idf_sys::nimble_port_freertos_deinit();
        }
    }
}
