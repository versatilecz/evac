import { defineConfig } from '../../configs/vite/lib'
import pkg from './package.json' with { type: 'json' }

export default defineConfig(import.meta.dirname, pkg, { entries: { vite: 'src/vite/index.ts' } })
