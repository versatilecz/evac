import { resolve } from 'node:path'

import vuePlugin, { type Options as VuePluginOptions } from '@vitejs/plugin-vue'
import { defineConfig as defineViteConfig, type PluginOption } from 'vite'
import dtsPlugin from 'vite-plugin-dts'

type NpmPackage = {
  name: string
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

type LibEntries = Record<string, string>

type ConfigOptions = {
  entries?: LibEntries
  plugins?: PluginOption[]
  vue?: VuePluginOptions | false
}

export function defineConfig(dirname: string, pkg: NpmPackage, config: ConfigOptions = {}) {
  const { entries = {}, plugins = [], vue = {} } = config

  if (checkForVueDependency(pkg) && vue !== false) {
    plugins.push(vuePlugin(vue))
  }

  return defineViteConfig({
    build: {
      lib: {
        entry: {
          index: resolve(dirname, 'src/index.ts'),
          ...resolveEntryPaths(entries, dirname),
        },
        formats: ['cjs', 'es'],
      },
      rollupOptions: {
        external: [
          /^node:/,
          ...Object.keys({
            ...(pkg.dependencies ?? {}),
            ...(pkg.peerDependencies ?? {}),
          }),
          pkg.name,
        ],
      },
      sourcemap: true,
      target: 'esnext',
      minify: true,
    },
    plugins: [dtsPlugin(), ...plugins],
  })
}

function checkForVueDependency(pkg: NpmPackage) {
  const allDependencies = new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})])
  return allDependencies.has('vue') || allDependencies.has('vue-demi')
}

function resolveEntryPaths(entries: LibEntries, dirname = '') {
  return Object.fromEntries(Object.entries(entries).map(([name, srcPath]) => [name, resolve(dirname, srcPath)]))
}
