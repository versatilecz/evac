import { service as activityService } from '@evac/activity'
import { service as alarmsService, activeAlarmService } from '@evac/alarms'
import * as Auth from '@evac/auth'
import { service as configService, backupService } from '@evac/config'
import { service as devicesService } from '@evac/devices'
import { Contact, ContactGroup, Location, Notification, Version } from '@evac/entities'
import { service as eventsService } from '@evac/events'
import { service as roomsService } from '@evac/rooms'
import { service as scannersService } from '@evac/scanners'
import { defineWebSocketServices, orchestrateWebSocketAndServices } from '@evac/shared'
import { storage } from './storage'

const services = defineWebSocketServices(
  [Auth.service.userInfo, storage.memory],
  [Auth.service.tokenDetail, storage.memory],
  [configService, storage.memory],
  [backupService, storage.memory],
  [Location.service, storage.memory],
  [roomsService, storage.memory],
  [scannersService, storage.memory],
  [devicesService, storage.memory],
  [activityService, storage.memory],
  [Notification.service, storage.memory],
  [alarmsService, storage.memory],
  [activeAlarmService, storage.memory],
  [eventsService, storage.memory],
  [Contact.service, storage.memory],
  [ContactGroup.service, storage.memory],
  [Version.service, storage.memory]
)

export default function handleServicesOverWebSocket(url: URL | string) {
  orchestrateWebSocketAndServices({ url, services })
}
