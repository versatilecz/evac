import aliasesDefinition from './aliases.json' with { type: 'json' }
import type { IconDescription } from './definitions'

const aliasDefinitions = new Map<string, string[]>(Object.entries(aliasesDefinition) as [string, string[]][])
const aliasKeys = new Set(aliasDefinitions.keys())

export function* collectAliases(key: string, aliases: Map<string, Iterable<string>> = aliasDefinitions): Generator<string> {
  const aliasesByKey = aliases.get(key)
  if (!aliasesByKey) return

  for (const alias of aliasesByKey) {
    if (aliasKeys.has(alias)) continue // Skip aliases that are also keys
    if (alias === key) continue // Skip the original key itself

    yield alias
  }
}

export function mapAllAliases(icons: Map<string, IconDescription>, aliases: Map<string, Iterable<string>> = aliasDefinitions): Map<string, IconDescription> {
  return new Map(collectDescriptionsByAliases(icons, aliases))
}

function* collectDescriptionsByAliases(icons: Map<string, IconDescription>, aliases: Map<string, Iterable<string>> = aliasDefinitions): Generator<[string, IconDescription]> {
  for (const [key, icon] of icons) {
    yield [key, icon]
    for (const alias of collectAliases(key, aliases)) {
      yield [alias, icon]
    }
  }
}
