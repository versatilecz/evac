use std::net::SocketAddr;
use uuid::Uuid;

pub struct ScannerMap {
    inner: Vec<(uuid::Uuid, SocketAddr)>,
}

impl ScannerMap {
    pub fn new() -> Self {
        ScannerMap { inner: Vec::new() }
    }
    pub fn get_uuid(&self, addr: &SocketAddr) -> Option<uuid::Uuid> {
        self.inner.iter().find(|r| r.1.eq(addr)).map(|r| r.0)
    }
    pub fn get_addr(&self, uuid: &uuid::Uuid) -> Option<SocketAddr> {
        self.inner.iter().find(|r| r.0.eq(uuid)).map(|r| r.1)
    }

    pub fn has_addr(&self, addr: &SocketAddr) -> bool {
        self.inner.iter().any(|r| r.1.eq(addr))
    }

    pub fn has_uuid(&self, uuid: &Uuid) -> bool {
        self.inner.iter().any(|r| r.0.eq(uuid))
    }

    pub fn set(&mut self, uuid: Uuid, addr: SocketAddr) {
        if let Some(r) = self
            .inner
            .iter_mut()
            .find(|r| r.0.eq(&uuid) || r.1.eq(&addr))
        {
            r.0 = uuid;
            r.1 = addr;
        } else {
            self.inner.push((uuid, addr));
        }
    }
}
