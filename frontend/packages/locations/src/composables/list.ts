import { applyFilters, logger, sortByRules, type $SortRule } from '@evac/shared'
import { formatCount } from '@evac/utils'
import { useObservable } from '@vueuse/rxjs'
import { pipe } from 'remeda'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { locations$ } from '@/data'
import { $Location } from '@/definitions'
import { $FilterByReference, filterByReference } from '@/misc/filter'

type FilterOptions = {
  reference?: MaybeRefOrGetter<$FilterByReference>
}

type Options = {
  filter?: FilterOptions
  sort?: MaybeRefOrGetter<$SortRule[]>
}

export function useLocations({ filter = {}, sort = [] }: Options = {}) {
  const referenceFilter = filter.reference ?? $FilterByReference.enum.all

  const data = useObservable(locations$, { onError: logger.error, initialValue: new Map<string, $Location>() })
  const all = computed(() => pipe([...data.value.values()], sortByRules(toValue(sort) ?? [])))
  const list = computed(() => pipe(data.value.values(), applyFilters([filterByReference(toValue(referenceFilter))]), sortByRules(toValue(sort) ?? [])))
  const count = computed(() => formatCount(data.value.size, list.value.length))

  return {
    count,
    data,
    list,
    all,
  }
}
