import type { $Location } from '@evac/locations'
import type { $Room } from '@evac/rooms'
import { applyFilters, logger, sortByRules, type $SortRule } from '@evac/shared'
import { formatCount } from '@evac/utils'
import { toRef } from '@vueuse/core'
import { from, useObservable } from '@vueuse/rxjs'
import { pipe } from 'remeda'
import * as Rx from 'rxjs'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { devices$, mapLocationToDevices, mapRoomToDevices, unallocatedDevices$ } from '@/data'
import { DEFAULT_SORT, $Device, $SourceType } from '@/definitions'

type Options = {
  sort?: MaybeRefOrGetter<$SortRule[] | $SortRule>
  sourceType?: $SourceType
  room?: MaybeRefOrGetter<$Room['uuid'] | undefined>
  location?: MaybeRefOrGetter<$Location['uuid'] | undefined>
}

export function useDevices(options: Options = {}) {
  const { sort = [DEFAULT_SORT] } = options
  const source$ = resolveSource(options)

  const data = useObservable(source$, { onError: logger.error, initialValue: new Map<string, $Device>() })
  const all = computed(() => [...data.value.values()])
  const list = computed(() => pipe(data.value.values(), applyFilters([]), sortByRules(toValue(sort))))
  const count = computed(() => formatCount(data.value.size, list.value.length))

  return {
    count,
    data,
    list,
    all,
  }
}

function resolveSource(options: Options) {
  const { sourceType = $SourceType.enum.all, room, location } = options
  if (sourceType === $SourceType.enum.all) {
    return devices$
  }

  if (sourceType === $SourceType.enum.unallocated) {
    return unallocatedDevices$
  }

  if (sourceType === $SourceType.enum.room) {
    if (!room) throw new Error('Room UUID must be provided when sourceType is "room"')
    return from(toRef(room)).pipe(Rx.filter(Boolean), mapRoomToDevices())
  }

  if (sourceType === $SourceType.enum.location) {
    if (!location) throw new Error('Location UUID must be provided when sourceType is "location"')
    return from(toRef(location)).pipe(Rx.filter(Boolean), mapLocationToDevices())
  }

  throw new Error(`Unsupported source type: ${sourceType}`)
}
