import { applyFilters, logger, sortByRules, type $SortRule } from '@evac/shared'
import { formatCount } from '@evac/utils'
import { useObservable } from '@vueuse/rxjs'
import { pipe } from 'remeda'
import { from } from 'rxjs'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { $Room } from '@/definitions'
import { service } from '@/service'

type UseRoomsOptions = {
  location?: MaybeRefOrGetter<string | null | undefined>
  sort?: MaybeRefOrGetter<$SortRule[]>
}

export function useRooms({ location, sort = [] }: UseRoomsOptions = {}) {
  const data = useObservable(from(service), { onError: logger.error, initialValue: new Map<string, $Room>() })
  const all = computed(() => [...data.value.values()])
  const list = computed(() => pipe(data.value.values(), applyFilters([filterByLocation]), sortByRules(toValue(sort) ?? [])))
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
