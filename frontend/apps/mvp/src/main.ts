import { createAuth } from '@evac/auth'
import { determineWebSocketURL } from '@evac/shared'
import { createStorage, type Storage } from 'unstorage'
import indexedDbDriver from 'unstorage/drivers/indexedb'
import { createApp, type App as VueApp } from 'vue'

import App from './App.vue'
import i18n from './i18n'
import router from './router'
import handleServicesOverWebSocket from './services'
import './style.css'

const storage = createStorage({ driver: indexedDbDriver({ dbName: 'evac', storeName: 'mvp' }) })
await initApp(storage)

async function initApp(storage: Storage) {
  let app: VueApp | null = null
  app = createApp(App)
  app.use(createAuth())
  app.use(router)
  app.use(i18n)
  app.mount('#app')

  await handleServicesOverWebSocket(determineWebSocketURL('/api/operator', window.location), storage)
}
