use core::fmt::Debug;

use crate::utilities::OsMBuf;
use esp_idf_svc::sys;

pub struct ReceivedData(sys::ble_l2cap_event__bindgen_ty_1__bindgen_ty_4);

impl ReceivedData {
  #[inline]
  pub(crate) fn from_raw(raw: sys::ble_l2cap_event__bindgen_ty_1__bindgen_ty_4) -> Self {
    Self(raw)
  }

  #[inline]
  pub fn conn_handle(&self) -> u16 {
    self.0.conn_handle
  }

  #[inline]
  pub fn data(&self) -> &[u8] {
    OsMBuf(self.0.sdu_rx).as_slice()
  }
}

impl Debug for ReceivedData {
  fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
    write!(f, "{:X?}", self.data())
  }
}

impl Drop for ReceivedData {
  fn drop(&mut self) {
    unsafe { super::os_mbuf_free(self.0.sdu_rx) };
  }
}
