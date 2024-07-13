import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import nightwatchPlugin from 'vite-plugin-nightwatch'
import VueDevTools from 'vite-plugin-vue-devtools'

const backend = {
  target: 'http://127.0.0.1:3030',
}
// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api/barman': {...backend, ws: true},
      '/api/report': backend
    }
  },
  plugins: [
    vue(),
    nightwatchPlugin(),
    VueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
