import * as z from 'zod'
import type { $Location } from '@/definitions'

export type $FilterByReference = z.infer<typeof $FilterByReference>
export const $FilterByReference = z.enum(['all', 'include', 'exclude'])

export type $LocationReference = z.infer<typeof $LocationReference>
const $LocationReference = z.object({
  location: z.uuid(),
})

export function filterByReference<T extends $LocationReference>(condition: $FilterByReference, references: Set<T> = new Set()) {
  return (location: $Location) => {
    switch (condition) {
      case $FilterByReference.enum.include: {
        const usedReferences = new Set(Iterator.from(references).map((x) => x.location))
        return usedReferences.has(location.uuid)
      }
      case $FilterByReference.enum.exclude: {
        const usedReferences = new Set(Iterator.from(references).map((x) => x.location))
        return !usedReferences.has(location.uuid)
      }
      case $FilterByReference.enum.all:
      default:
        return true
    }
  }
}
