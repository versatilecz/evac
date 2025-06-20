import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useWebSocket } from '@vueuse/core'

import App from './App.vue'
import router from './router'

import { useMainStore } from '@/stores/mainStore'
import { useConfigStore } from '@/stores/configStore'
import { useLocationStore } from '@/stores/locationStore'
import { useRoomStore } from '@/stores/roomStore'
import { useScannerStore } from '@/stores/scannerStore'
import { useDeviceStore } from '@/stores/deviceStore'

const schema = window.location.protocol.replace('http', 'ws')
const hostname = window.location.host

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const websocket = useWebSocket(`${schema}//${hostname}/api/operator`, {
    autoReconnect: true,
    retries: 3,
    delay: 1000,
    onFailed() {
      alert('Failed to connect WebSocket after 3 retries')
    }
  })

  app.provide('$websocket', websocket)

useMainStore()
useConfigStore()
useLocationStore()
useRoomStore()
useScannerStore()
useDeviceStore()

app.mount('#app')
