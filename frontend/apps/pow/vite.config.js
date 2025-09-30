import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import nightwatchPlugin from 'vite-plugin-nightwatch'
import VueDevTools from 'vite-plugin-vue-devtools'

const backend = {
  target: 'http://127.0.0.1:3030',
}
// https://vitejs.dev/config/
export default defineConfig({
  root: import.meta.dirname,
  server: {
    proxy: {
      '/api/operator': { ...backend, ws: true },
    },
  },
  plugins: [vue(), nightwatchPlugin(), VueDevTools()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
})
