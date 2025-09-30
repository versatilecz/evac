import { service as configService, parseMessages as parseConfig } from '@evac/config'
import { service as devicesService, parseMessages as parseDevices } from '@evac/devices'
import { service as locationsService, parseMessages as parseLocations } from '@evac/locations'
import { service as roomsService, parseMessages as parseRooms } from '@evac/rooms'
import { service as scannersService, parseMessages as parseScanners } from '@evac/scanners'
import { defineWebSocketServices, determineWebSocketURL, orchestrateWebSocketAndServices, logger } from '@evac/shared'
import { createStorage, type Storage } from 'unstorage'
import indexedDbDriver from 'unstorage/drivers/indexedb'
import { createApp, type App as VueApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import routes from './router/routes'
import './style.css'

const storage = createStorage({ driver: indexedDbDriver({ dbName: 'evac', storeName: 'mvp' }) })
await initApp(storage)

async function initApp(storage: Storage) {
  let app: VueApp | null = null
  const abortController = new AbortController()

  try {
    const router = createRouter({
      history: createWebHistory(),
      routes,
    })

    app = createApp(App)
    app.use(router)
    app.mount('#app')

    await orchestrateWebSocketAndServices({
      url: determineWebSocketURL('/api/operator', window.location),
      services: defineWebSocketServices(
        [configService, parseConfig],
        [locationsService, parseLocations],
        [roomsService, parseRooms],
        [scannersService, parseScanners],
        [devicesService, parseDevices]
      ),
      storage,
    })

    logger.log('[ws] connection closed')
  } catch (e) {
    logger.error('[ws] error:', e)
  } finally {
    app?.unmount()
    abortController.abort()
  }
}
