import type { Dirent } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { basename, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { parse, type INode } from 'svgson'
import pkg from '../package.json' with { type: 'json' }
import predefinedIcons from './icons.json' with { type: 'json' }

import { collectAliases } from './aliases'
import type { IconDescription } from './definitions'

type IconsInput = Iterable<string | [string, string]> | Record<string, string>

const assetsDirectory = 'icons' // Path to the directory containing the icons, relative to the package root
const packageAssetsBaseDirectory = join(pkg.name, assetsDirectory) // Path to the icons directory in the package
const iconsAbsolutePath = resolve(import.meta.dirname, '..', assetsDirectory)

export async function getIcons(icons: IconsInput = predefinedIcons): Promise<Map<IconDescription['name'], IconDescription>> {
  try {
    const normalized = new Map(normalizeIcons(icons))
    const parsed = await Promise.all([...parseSVGFiles(normalized)])
    return new Map(parsed)
  } catch (cause) {
    const error = new Error('Error loading icons', { cause })
    throw error
  }
}

export async function getIconsFromAssets(): Promise<Map<IconDescription['name'], IconDescription>> {
  try {
    const svgFiles = await getIconsFromDirectory(iconsAbsolutePath)
    const icons = await Promise.all([...parseSVGFiles(normalizeIconsFromDirents(svgFiles))])
    return new Map(icons)
  } catch (cause) {
    const error = new Error('Error loading icons from assets', { cause })
    throw error
  }
}

async function getIconsFromDirectory(path: string): Promise<Iterable<Dirent>> {
  const contents = await readdir(path, { withFileTypes: true })
  return filterSVGFiles(contents)
}

function* filterSVGFiles(files: Iterable<Dirent>): Generator<Dirent> {
  for (const file of files) {
    if (file.isFile() && file.name.endsWith('.svg')) {
      yield file
    }
  }
}

function* parseSVGFiles(files: Iterable<[string, string]>): Generator<Promise<[string, IconDescription]>> {
  for (const [iconName, file] of files) {
    yield readFile(file, 'utf-8')
      .then(parse)
      .then((svg) => createIconDescriptionFromSVG(svg, file))
      .then((icon) => [iconName, icon] as [string, IconDescription])
      .catch((cause) => {
        const error = new Error(`Error parsing SVG icon ${iconName}:`, { cause })
        throw error
      })
  }
}

function getIconNameFromFile(file: string): string {
  return basename(file, extname(file))
}

function createIconDescriptionFromSVG(svg: INode, file: string): IconDescription {
  const paths = Array.from(collectSVGPaths(svg))
  const name = getIconNameFromFile(file)

  return {
    name,
    asset: join(packageAssetsBaseDirectory, basename(file)),
    aliases: new Set(collectAliases(name)),
    src: file,
    paths,
  } satisfies IconDescription
}

function* collectSVGPaths(svg: INode): Generator<string> {
  for (const child of svg.children) {
    if (child.name === 'path' && child.attributes.d) {
      yield child.attributes.d
    } else if (child.children) {
      yield* collectSVGPaths(child)
    }
  }
}

function* normalizeIconsFromDirents(files: Iterable<Dirent>): Generator<[string, string]> {
  for (const file of files) {
    const name = getIconNameFromFile(file.name)
    const path = resolve(file.parentPath, file.name)
    yield [name, path]
  }
}

function* normalizeIcons(input: IconsInput): Generator<[string, string]> {
  if (!input) {
    return
  }

  if (isRecord(input)) {
    for (const [key, value] of Object.entries(input)) {
      yield [key, resolveIconPath(value)]
    }
    input = Object.values(input)
  }

  for (const icon of input) {
    if (Array.isArray(icon)) {
      const [name, path] = icon
      yield [name, resolveIconPath(path)]
      continue
    }

    const iconPath = resolveIconPath(icon)
    const name = basename(icon, extname(icon))
    yield [name, iconPath]
  }
}

function isRecord(input: unknown): input is Record<string, string> {
  return typeof input === 'object' && input !== null && !Reflect.has(input, Symbol.iterator)
}

function resolveIconPath(iconPath: string): string {
  return fileURLToPath(import.meta.resolve(iconPath))
}
