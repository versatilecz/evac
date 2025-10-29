import { service as activityService } from '@evac/activity'
import { service as alarmsService } from '@evac/alarms'
import { service as configService, backupService } from '@evac/config'
import { service as devicesService } from '@evac/devices'
import { service as emailsService } from '@evac/emails'
import { service as locationsService } from '@evac/locations'
import { service as roomsService } from '@evac/rooms'
import { service as scannersService } from '@evac/scanners'
import { defineWebSocketServices, orchestrateWebSocketAndServices, logger } from '@evac/shared'
import type { Storage } from 'unstorage'

export default async function handleServicesOverWebSocket(url: URL | string, storage: Storage) {
  try {
    await orchestrateWebSocketAndServices({
      url,
      services: defineWebSocketServices(
        configService,
        backupService,
        locationsService,
        roomsService,
        scannersService,
        devicesService,
        activityService,
        alarmsService,
        emailsService
      ),
      storage,
    })

    logger.warn('[ws] connection closed')
  } catch (e) {
    logger.error('[ws] error', e)
  }
}
