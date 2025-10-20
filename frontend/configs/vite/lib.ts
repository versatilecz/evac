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
    root: dirname,
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      lib: {
        entry: {
          index: 'src/index.ts',
          ...entries,
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
    resolve: {
      alias: {
        '@': resolve(dirname, './src'),
      },
    },
  })
}

function checkForVueDependency(pkg: NpmPackage) {
  const allDependencies = new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})])
  return allDependencies.has('vue') || allDependencies.has('vue-demi')
}
