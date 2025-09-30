import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@evac/shared': resolve(__dirname, '../../packages/shared/src'),
      '@evac/ui': resolve(__dirname, '../../packages/ui/src'),
      '@evac/utils': resolve(__dirname, '../../packages/utils/src'),
    },
  },
})
