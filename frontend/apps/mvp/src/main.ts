import { plugin as auth } from '@evac/auth'
import { determineWebSocketURL } from '@evac/shared'
import { plugin as ui } from '@evac/ui'
import { createApp, type App as VueApp } from 'vue'

import App from './App.vue'
import i18n from './i18n'
import router from './router'
import handleServicesOverWebSocket from './services'
import { storage } from './storage'
import './style.css'

initApp()

function initApp() {
  let app: VueApp | null = null
  app = createApp(App)
  app.use(auth({ storage: storage.session }))
  app.use(ui({ storage: storage.indexedDb }))
  app.use(router)
  app.use(i18n)
  app.mount('#app')

  handleServicesOverWebSocket(determineWebSocketURL('/api/operator', window.location))
}
