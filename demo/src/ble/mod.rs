mod address;
mod advertised_data;
mod advertised_device;
mod client;
mod device;
mod enums;
mod error;
mod scan;
mod uuid;

#[inline]
pub(crate) unsafe fn voidp_to_ref<'a, T>(ptr: *mut core::ffi::c_void) -> &'a mut T {
    &mut *ptr.cast()
}

//pub static mut OWN_ADDR_TYPE: enums::OwnAddrType = enums::OwnAddrType::Public;
