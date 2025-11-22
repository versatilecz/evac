import { resolve } from 'node:path'
import { configDefaults, defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: import.meta.dirname,
    },
    resolve: {
      alias: {
        '@': resolve(import.meta.dirname, './src'),
        '@evac/shared': resolve(import.meta.dirname, '../../packages/shared/src'),
        '@evac/ui': resolve(import.meta.dirname, '../../packages/ui/src'),
      },
    },
  })
)
