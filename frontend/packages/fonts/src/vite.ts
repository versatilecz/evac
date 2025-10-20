import { createReadStream } from 'node:fs'
import { copyFile, mkdir, readdir, stat } from 'node:fs/promises'
import type { ServerResponse } from 'node:http'
import { resolve, join } from 'node:path'
import type { Connect, HtmlTagDescriptor, Plugin, ResolvedConfig } from 'vite'
import { fonts, type FontDefinition } from './definitions'

export type PluginOptions = {}

export default (options: PluginOptions = {}): Plugin => {
  // Reserved for future use (e.g., custom base path)
  void options
  let config: ResolvedConfig

  return {
    name: '@evac/fonts',

    configResolved(resolvedConfig) {
      config = resolvedConfig
    },

    configureServer(server) {
      for (const font of fonts) {
        // Serve font files during development
        server.middlewares.use(addServerMiddlewareForFont(font))
      }
    },

    transformIndexHtml(html) {
      return {
        html,
        tags: [...generatePreloadLinksForAllFonts(), ...generateStyleTagsForAllFonts()],
      }
    },

    async generateBundle() {
      if (config.command !== 'build') return

      for (const font of fonts) {
        await generateBundleForFont(font, config)
      }
    },
  }
}

function addServerMiddlewareForFont(font: FontDefinition) {
  return async (req: Connect.IncomingMessage, res: ServerResponse<Connect.IncomingMessage>, next: () => void) => {
    if (!req.url?.startsWith(font.publicPath)) {
      return void next()
    }
    const fileName = req.url.slice(font.publicPath.length + 1)
    const filePath = join(font.src, fileName)

    try {
      const fileStat = await stat(filePath)

      if (fileStat.isFile()) {
        res.setHeader('Content-Type', 'font/ttf')
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        createReadStream(filePath).pipe(res)
        return
      }
    } catch {
      // File not found, continue
    }
    next()
  }
}

function* generatePreloadLinksForAllFonts(): Generator<HtmlTagDescriptor> {
  for (const font of fonts) {
    yield* generatePreloadLinksForFont(font)
  }
}

function* generatePreloadLinksForFont(font: FontDefinition): Generator<HtmlTagDescriptor> {
  for (const style of font.styles) {
    yield {
      tag: 'link',
      attrs: {
        rel: 'preload',
        as: 'font',
        type: 'font/ttf',
        href: `${font.publicPath}/${style.src}`,
        crossorigin: 'anonymous',
      },
      injectTo: 'head-prepend',
    }
  }
}

function* generateStyleTagsForAllFonts(): Generator<HtmlTagDescriptor> {
  for (const font of fonts) {
    yield {
      tag: 'style',
      injectTo: 'head',
      attrs: {
        type: 'text/css',
        'data-font': font.family,
      },
      children: [...generateCssForFont(font)].join('\n'),
    }
  }
}

function* generateCssForFont(font: FontDefinition): Generator<string> {
  for (const style of font.styles) {
    yield `@font-face {`
    yield `  font-family: '${font.family}';`
    yield `  src: url('${font.publicPath}/${style.src}') format('${resolveFormat(style.weight)}');`
    yield `  font-weight: ${style.weight};`
    yield `  font-style: ${style.style};`
    yield `  font-display: swap;`
    yield `}`
  }

  function resolveFormat(fontWeight: string): string {
    if (fontWeight.includes(' ')) {
      return 'truetype-variations'
    }
    return 'truetype'
  }
}

async function generateBundleForFont(font: FontDefinition, config: ResolvedConfig) {
  const outDir = resolve(config.root, config.build.outDir)
  const targetDir = join(outDir, font.publicPath)

  try {
    await mkdir(targetDir, { recursive: true })

    const files = await readdir(font.src)
    const fontFiles = files.filter((file) => file.endsWith('.ttf'))

    await Promise.all(fontFiles.map((file) => copyFile(join(font.src, file), join(targetDir, file))))

    console.log(`[@evac/fonts] Copied ${fontFiles.length} font file(s) to ${targetDir}`)
  } catch (error) {
    console.error('[@evac/fonts] Error copying font files:', error)
    throw error
  }
}
