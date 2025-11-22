import { intersectFilters, formatCount, logger, sortByRules, type SortRule } from '@evac/shared'
import { useObservable } from '@vueuse/rxjs'
import { pipe } from 'remeda'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { scanners$ } from '@/data'
import { DEFAULT_SORT, $Scanner } from '@/definitions'

type Options = {
  room?: MaybeRefOrGetter<string | null | undefined>
  sort?: MaybeRefOrGetter<SortRule[] | SortRule>
}

export function useScanners({ room, sort = [DEFAULT_SORT] }: Options = {}) {
  const data = useObservable(scanners$, { onError: logger.error, initialValue: new Map<string, $Scanner>() })
  const all = computed(() => [...data.value.values()])
  const list = computed(() => pipe(data.value.values(), intersectFilters([filterByRoom]), sortByRules(toValue(sort))))
  const byRoom = computed(() => Map.groupBy(data.value.values(), (scanner) => scanner.room ?? ''))
  const count = computed(() => formatCount(data.value.size, list.value.length))

  return {
    count,
    data,
    list,
    all,
    byRoom,
  }

  function filterByRoom(scanner: $Scanner) {
    const roomFilter = toValue(room)
    if (!roomFilter) return true
    return scanner.room === roomFilter
  }
}
