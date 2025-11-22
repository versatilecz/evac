import { intersectFilters, formatCount, logger, sortByRules, type SortRule } from '@evac/shared'
import { useObservable } from '@vueuse/rxjs'
import { pipe } from 'remeda'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { events$ } from '../data'
import { $EventKind, DEFAULT_SORT, type $Event } from '../definitions'

type Options = {
  sort?: MaybeRefOrGetter<SortRule[] | SortRule>
}

export function useEvents(options: Options = {}) {
  const { sort = [DEFAULT_SORT] } = options

  const excludeKind = new Set<$EventKind>([$EventKind.enum.advertisement])
  const includeKind = new Set<$EventKind>([])

  const data = useObservable(events$, { onError: logger.error, initialValue: new Map<string, $Event>() })
  const all = computed(() => [...data.value.values()])
  const list = computed(() => pipe(data.value.values(), intersectFilters([filterByKind({ exclude: excludeKind, include: includeKind })]), sortByRules(toValue(sort))))
  const count = computed(() => formatCount(data.value.size, list.value.length))

  return {
    count,
    data,
    list,
    all,
  }
}

function filterByKind({ exclude, include }: { exclude?: Set<$EventKind>; include?: Set<$EventKind> }) {
  return function filterEventsByKind(event: $Event) {
    if (include && include.size > 0) {
      return include.has(event.kind)
    }
    if (exclude && exclude.size > 0) {
      return !exclude.has(event.kind)
    }
    return true
  }
}
