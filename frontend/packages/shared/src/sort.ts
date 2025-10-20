import { syncRef } from '@vueuse/core'
import { ref, type Ref } from 'vue'
import * as z from 'zod'

export type $SortRule = z.infer<typeof $SortRule>
export type $SortDirection = z.infer<typeof $SortDirection>

export const $SortDirection = z.enum({
  Ascending: 1,
  Descending: -1,
  None: 0,
})

export const $SortRule = z.object({
  key: z.string(),
  direction: $SortDirection,
})

export function sortByRules<T>(rules: $SortRule[] | $SortRule): (input: Iterable<T>) => T[]
export function sortByRules<T>(input: Iterable<T>, rules: $SortRule[] | $SortRule): T[]
export function sortByRules<T>(...args: [$SortRule[] | $SortRule] | [Iterable<T>, $SortRule[] | $SortRule]) {
  if (args.length === 1) {
    return (input: Iterable<T>) => sort(input, ensureArray(args[0]))
  } else {
    return sort(args[0], ensureArray(args[1]))
  }

  function sort(input: Iterable<T>, rules: unknown) {
    const safeRules = z.array($SortRule).parse(rules)

    return Array.from(input).toSorted((a, b) => {
      for (const rule of safeRules) {
        const aValue = (a as any)[rule.key]
        const bValue = (b as any)[rule.key]

        if (aValue < bValue) {
          return -1 * rule.direction
        } else if (aValue > bValue) {
          return 1 * rule.direction
        }
      }
      return 0
    })
  }

  function ensureArray(rules: $SortRule[] | $SortRule): $SortRule[] {
    return Array.isArray(rules) ? rules : [rules]
  }
}

export function changeSortRule(sort: $SortRule, key: string): $SortRule {
  const next = { ...sort }
  if (next.key === key) {
    next.direction = next.direction === $SortDirection.enum.Ascending ? $SortDirection.enum.Descending : $SortDirection.enum.Ascending
  } else {
    next.key = key
    next.direction = $SortDirection.enum.Ascending
  }
  return next
}

type UseSortOptions = {
  initial?: $SortRule
  modelValue?: Ref<$SortRule>
}
export function useSort({ initial, modelValue }: UseSortOptions) {
  if (!initial && !modelValue) {
    throw new Error('Either initial or modelValue must be provided to useSort')
  }
  const sort = ref<$SortRule>(modelValue?.value ?? initial!)
  if (modelValue) syncRef(sort, modelValue)

  return {
    sort,
    sortBy,
  }

  function sortBy(key: $SortRule['key'], direction?: $SortDirection) {
    if (direction) {
      sort.value = { key, direction } // Direct assignment if direction is provided
      return
    }
    sort.value = changeSortRule(sort.value, key)
  }
}
