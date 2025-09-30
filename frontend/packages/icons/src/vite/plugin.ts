import { glob, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { IndexHtmlTransformResult, Plugin, ResolvedConfig } from 'vite'

import { type IconDescription } from '../definitions'
import { mapAllAliases } from '../aliases'
import { getIcons } from '../assets'

import { filterIcons, viewBox, type IconFilters } from './misc'
import pkg from '../../package.json' with { type: 'json' }

type Options = {
  /** SVG sprite element's ID */
  id?: string
  /** Prefix for icon IDs */
  prefix?: string
} & IconFilters

const ICONS_MODULE_ID = pkg.name + '/vite'

export default function iconVitePlugin(options: Options = {}): Plugin[] {
  let resolvedConfig: ResolvedConfig

  return [
    {
      name: `${ICONS_MODULE_ID}:transform`,

      configResolved(config) {
        resolvedConfig = config
      },

      async transformIndexHtml(html): Promise<IndexHtmlTransformResult> {
        const allIcons = await getIcons()
        const filteredIcons = new Map(filterIcons(allIcons, options))
        const allIconsAndAliases = mapAllAliases(filteredIcons)
        const iconsByContent = new Map(
          await collectAsyncIterable(
            searchContents(allIconsAndAliases, {
              content: options.content ?? [],
              prefix: options.prefix ?? '',
              root: resolvedConfig.root,
            })
          )
        )

        return {
          html,
          tags: [
            {
              tag: 'svg',
              injectTo: 'body-prepend',
              attrs: {
                xmlns: 'http://www.w3.org/2000/svg',
                style: 'height: 0; overflow: hidden; position: absolute;',
                id: options.id || 'icon-sprite',
              },
              children: [...generateSprite(iconsByContent, options.prefix ?? '')],
            },
          ],
        }
      },
    },
  ]
}

async function collectAsyncIterable<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const result = []
  for await (const value of iterable) {
    result.push(value)
  }
  return result
}

type SearchContentsConfig = {
  content: Iterable<string>
  root: string
  prefix: string
}
async function* searchContents(
  icons: Map<string, IconDescription>,
  { content, root, prefix }: SearchContentsConfig
): AsyncGenerator<[string, IconDescription]> {
  const globPatterns = Array.from(content)
  if (!globPatterns.length) {
    yield* icons.entries()
    return
  }

  for await (const content of readFilesByPatterns(globPatterns, root)) {
    for (const icon of checkFileForIcons(icons.keys(), content, prefix)) {
      const definition = icons.get(icon)
      if (!definition) continue
      yield [icon, definition]
    }
  }
}

async function* readFilesByPatterns(globPatterns: Iterable<string>, root: string) {
  for (const pattern of globPatterns) {
    const g = glob(pattern, { cwd: root, withFileTypes: true })
    for await (const file of g) {
      if (!file.isFile()) continue
      const filePath = join(file.parentPath, file.name)
      const content = await readFile(filePath, 'utf-8')
      yield content
    }
  }
}

function* checkFileForIcons(icons: Iterable<string>, fileContent: string, prefix: string) {
  const normalizedContent = fileContent.toLowerCase()
  for (const icon of icons) {
    const prefixed = `${prefix}${icon}`
    const search = [`"${prefixed}"`, `'${prefixed}'`, `#${prefixed}"`]

    if (search.some((s) => normalizedContent.includes(s.toLowerCase()))) {
      yield icon
    }
  }
}

function* generateSprite(icons: Map<string, IconDescription>, prefix: string) {
  for (const [name, icon] of icons) {
    yield {
      tag: 'symbol',
      attrs: {
        id: `${prefix}${name}`,
        viewBox,
      },
      children: [...generateIconPaths(icon)],
    }
  }
}

function* generateIconPaths(icon: IconDescription) {
  for (const path of icon.paths) {
    yield {
      tag: 'path',
      attrs: {
        d: path,
      },
    }
  }
}
