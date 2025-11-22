/* Plain format functions with behavior specific to this project */

export function formatCount(all: number, filtered: number): string {
  if (all === filtered) {
    return `${all}`
  }
  return `${filtered} / ${all}`
}
