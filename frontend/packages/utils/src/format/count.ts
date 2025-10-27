export function formatCount(all: number, filtered: number): string {
  if (all === filtered) {
    return `${all}`
  }
  return `${filtered} / ${all}`
}
