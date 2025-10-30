import { service as activityService } from '@evac/activity'
import { service as alarmsService, activeAlarmService } from '@evac/alarms'
import { service as configService, backupService } from '@evac/config'
import { service as devicesService } from '@evac/devices'
import { service as emailsService } from '@evac/emails'
import { service as locationsService } from '@evac/locations'
import { service as roomsService } from '@evac/rooms'
import { service as scannersService } from '@evac/scanners'
import { defineWebSocketServices, orchestrateWebSocketAndServices } from '@evac/shared'
import type { Storage } from 'unstorage'

const services = defineWebSocketServices(
  configService,
  backupService,
  locationsService,
  roomsService,
  scannersService,
  devicesService,
  activityService,
  emailsService,
  alarmsService,
  activeAlarmService
)

export default function handleServicesOverWebSocket(url: URL | string, storage: Storage) {
  orchestrateWebSocketAndServices({ url, services, storage })
}
