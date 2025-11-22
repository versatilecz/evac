import { intersectFilters, formatCount, logger, sortByRules, type SortRule } from '@evac/shared'
import { useObservable } from '@vueuse/rxjs'
import { pipe } from 'remeda'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { rooms$ } from '@/data'
import { $Room } from '@/definitions'

type UseRoomsOptions = {
  location?: MaybeRefOrGetter<string | null | undefined>
  sort?: MaybeRefOrGetter<SortRule[]>
}

export function useRooms({ location, sort = [] }: UseRoomsOptions = {}) {
  const data = useObservable(rooms$, { onError: logger.error, initialValue: new Map<string, $Room>() })
  const all = computed(() => [...data.value.values()])
  const list = computed(() => pipe(data.value.values(), intersectFilters([filterByLocation]), sortByRules(toValue(sort) ?? [])))
  const byLocation = computed(() => Map.groupBy(data.value.values(), (room) => room.location ?? ''))
  const count = computed(() => formatCount(data.value.size, list.value.length))

  return {
    count,
    data,
    list,
    all,
    byLocation,
  }

  function filterByLocation(room: $Room) {
    const locationFilter = toValue(location)
    if (!locationFilter) return true
    return room.location === locationFilter
  }
}
