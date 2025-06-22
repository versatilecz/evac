use crate::{database::entities, message::web::WebMessage};
use uuid::timestamp::context;

#[derive(Debug, Clone)]
pub struct Operator {
    pub uuid: uuid::Uuid,
    pub context: crate::context::ContextWrapped,
    pub sender: tokio::sync::mpsc::Sender<crate::message::web::WebMessage>,
}

impl Operator {
    pub async fn process(&self, msg: crate::message::web::WebMessage) -> anyhow::Result<()> {
        match msg {
            WebMessage::LocationSet(location) => {
                let mut context = self.context.write().await;
                let location =
                    if let Some(saved) = context.database.data.locations.get_mut(&location.uuid) {
                        saved.name = location.name.clone();
                        saved.clone()
                    } else {
                        context
                            .database
                            .data
                            .locations
                            .insert(location.uuid.clone(), location.clone());
                        location
                    };

                self.sender
                    .send(WebMessage::LocationDetail(location.clone()))
                    .await;
                Ok(())
            }

            WebMessage::LocationRemove(uuid) => {
                let mut context = self.context.write().await;
                context.database.data.locations.remove(&uuid);
                self.sender
                    .send(crate::message::web::WebMessage::LocationRemoved(uuid))
                    .await;

                Ok(())
            }
            WebMessage::RoomSet(room) => {
                let mut context = self.context.write().await;
                let room = if let Some(saved) = context.database.data.rooms.get_mut(&room.uuid) {
                    saved.name = room.name.clone();
                    saved.location = room.location.clone();
                    saved.clone()
                } else {
                    context
                        .database
                        .data
                        .rooms
                        .insert(room.uuid.clone(), room.clone());
                    room
                };

                self.sender.send(WebMessage::RoomDetail(room.clone())).await;
                Ok(())
            }

            WebMessage::RoomRemove(uuid) => {
                let mut context: tokio::sync::RwLockWriteGuard<'_, crate::context::Context> =
                    self.context.write().await;
                context.database.data.rooms.remove(&uuid);
                self.sender
                    .send(crate::message::web::WebMessage::RoomRemoved(uuid))
                    .await;

                Ok(())
            }
            WebMessage::ScannerSet(scanner) => {
                let mut context = self.context.write().await;
                let scanner: crate::database::entities::Scanner =
                    if let Some(saved) = context.database.data.scanners.get_mut(&scanner.uuid) {
                        saved.name = scanner.name.clone();
                        saved.room = scanner.room.clone();
                        saved.clone()
                    } else {
                        context
                            .database
                            .data
                            .scanners
                            .insert(scanner.uuid, scanner.clone());
                        scanner
                    };

                self.sender
                    .send(WebMessage::ScannerDetail(scanner.clone()))
                    .await;

                Ok(())
            }
            WebMessage::ScannerRemove(uuid) => {
                let mut context = self.context.write().await;
                context.database.data.scanners.remove(&uuid);
                self.sender
                    .send(crate::message::web::WebMessage::ScannerRemoved(uuid))
                    .await;

                Ok(())
            }
            WebMessage::DeviceSet(device) => {
                let mut context = self.context.write().await;
                if let Some(saved) = context.database.data.devices.get_mut(&device.uuid) {
                    saved.name = device.name.clone();
                    saved.enable = device.enable;

                    self.sender
                        .send(WebMessage::DeviceDetail(saved.clone()))
                        .await;
                }

                Ok(())
            }
            WebMessage::DeviceRemove(uuid) => {
                let mut context = self.context.write().await;
                context.database.data.devices.remove(&uuid);
                self.sender
                    .send(crate::message::web::WebMessage::DeviceRemoved(uuid))
                    .await;

                Ok(())
            }
            _ => Ok(()),
        }
    }
}
