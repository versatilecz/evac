import type { IconDescription } from '../definitions'

export type IconFilters = {
  include?: Iterable<string>
  exclude?: Iterable<string>
  search?: string
  content?: Iterable<string>
}

type IconInstance = Pick<IconDescription, 'name' | 'aliases'>

export const viewBox = '0 -960 960 960' // default viewBox for all icons

export function filterIcons<T extends IconInstance>(icons: Iterable<[string, T]>, filters: IconFilters): Generator<[string, T]>
export function filterIcons<T extends IconInstance>(icons: Iterable<T>, filters: IconFilters): Generator<T>
export function* filterIcons<T extends IconInstance>(icons: Iterable<T | [string, T]>, filters: IconFilters): Generator<typeof icons extends [string, T] ? [string, T] : T> {
  const include = toSet(filters.include)
  const exclude = toSet(filters.exclude)
  const search = normalizeSearch(filters.search ?? '')

  for (const input of icons) {
    let name: string
    let icon: T

    if (Array.isArray(input)) {
      ;[name, icon] = input
      if (shouldYieldIcon(name) || [...icon.aliases].some((alias) => shouldYieldIcon(alias))) {
        yield [name, icon] as never
      }
      continue
    }

    name = input.name
    icon = input
    if (shouldYieldIcon(name) || [...icon.aliases].some((alias) => shouldYieldIcon(alias))) {
      yield icon
    }
  }

  function shouldYieldIcon(key: string): boolean {
    const fitsSearch = normalizeSearch(key).includes(search)
    const isIncluded = include.size === 0 || include.has(key)
    const isExcluded = exclude.has(key)

    return fitsSearch && isIncluded && !isExcluded
  }

  function normalizeSearch(input: string): string {
    return input.toLowerCase()
  }
}

function toSet(input: Iterable<string> | string | undefined | null): Set<string> {
  if (!input) return new Set()
  if (typeof input === 'string') return new Set([input])
  return new Set(input)
}
