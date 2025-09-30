import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  root: import.meta.dirname,
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
})
