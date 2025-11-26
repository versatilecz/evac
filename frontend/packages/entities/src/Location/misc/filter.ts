import * as def from '../definitions'

export function byName(name: string) {
  return function filterItemsByName(item: def.Detail) {
    if (!name || name.trim() === '') return true
    return item.name.toLowerCase().includes(name.toLowerCase())
  }
}

export function byReference<T extends def.Reference>(condition: def.ReferenceFilter, references: Set<T> = new Set()) {
  return (location: def.Detail) => {
    switch (condition) {
      case def.ReferenceFilter.enum.include: {
        const usedReferences = new Set(Iterator.from(references).map((x) => x.location))
        return usedReferences.has(location.uuid)
      }
      case def.ReferenceFilter.enum.exclude: {
        const usedReferences = new Set(Iterator.from(references).map((x) => x.location))
        return !usedReferences.has(location.uuid)
      }
      case def.ReferenceFilter.enum.all:
      default:
        return true
    }
  }
}
