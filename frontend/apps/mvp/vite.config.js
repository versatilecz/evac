import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import fonts from '@evac/fonts/vite'
import icons from '@evac/icons/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const backend = {
  target: process.env.BACKEND_URL || 'http://localhost:3030',
}

export default defineConfig({
  root: import.meta.dirname,
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  plugins: [
    icons({
      prefix: 'icon-',
      content: ['./index.html', './src/**/*.{vue,js,ts}', '../../packages/*/src/**/*.{vue,js,ts}'],
    }),
    fonts(),
    vue(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/operator': { ...backend, ws: true },
      '/api/version': { ...backend },
    },
  },
})
