import * as z from 'zod'

export type $SortRule = z.infer<typeof $SortRule>
export type $SortDirection = z.infer<typeof $SortDirection>

export const $SortDirection = z.enum({
  Ascending: 1,
  Descending: -1,
  None: 0,
})

export const $SortRule = z.object({
  by: z.string(),
  direction: $SortDirection,
})

export function sortByRules<T>(rules: $SortRule[]): (input: Iterable<T>) => T[]
export function sortByRules<T>(input: Iterable<T>, rules: $SortRule[]): T[]
export function sortByRules<T>(...args: [$SortRule[]] | [Iterable<T>, $SortRule[]]) {
  if (args.length === 1) {
    return (input: Iterable<T>) => sort(input, args[0])
  } else {
    return sort(args[0], args[1])
  }

  function sort(input: Iterable<T>, rules: unknown) {
    const safeRules = z.array($SortRule).parse(rules)

    return Array.from(input).toSorted((a, b) => {
      for (const rule of safeRules) {
        const aValue = (a as any)[rule.by]
        const bValue = (b as any)[rule.by]

        if (aValue < bValue) {
          return -1 * rule.direction
        } else if (aValue > bValue) {
          return 1 * rule.direction
        }
      }
      return 0
    })
  }
}
