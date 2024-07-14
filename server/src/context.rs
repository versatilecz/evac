pub struct Context {
    pub database: crate::database::Database,
    // All workers listen this events
    pub global_broadcast: tokio::sync::broadcast::Sender<shared::messages::global::GlobalMessage>,
    // All web clients listen this event
    pub web_broadcast: tokio::sync::broadcast::Sender<shared::messages::web::WebMessage>,
    // All device client listen this event
    pub device_broadcast: tokio::sync::broadcast::Sender<shared::messages::scanner::ScannerMessage>,
    /*
    // Device clients
    pub devices: BTreeMap<uuid::Uuid, device::Device>,
    // Web clients
    pub clients: BTreeMap<uuid::Uuid, client::Client>,
    */
}
