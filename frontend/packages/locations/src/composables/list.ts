import { applyFilters, logger, sortByRules, type $SortRule } from '@evac/shared'
import { useObservable } from '@vueuse/rxjs'
import { pipe } from 'remeda'
import { from } from 'rxjs'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { $Location } from '@/definitions'
import { $FilterByReference, filterByReference } from '@/misc/filter'
import { service } from '@/service'

type FilterOptions = {
  reference?: MaybeRefOrGetter<$FilterByReference>
}

type Options = {
  filter?: FilterOptions
  sort?: MaybeRefOrGetter<$SortRule[]>
}

export function useLocations({ filter = {}, sort = [] }: Options = {}) {
  const referenceFilter = filter.reference ?? $FilterByReference.enum.all

  const data = useObservable(from(service), { onError: logger.error, initialValue: new Map<string, $Location>() })
  const all = computed(() => [...data.value.values()])
  const list = computed(() => pipe(all.value, applyFilters([filterByReference(toValue(referenceFilter))]), sortByRules(toValue(sort) ?? [])))
  const count = computed(() => data.value.size)

  return {
    count,
    data,
    list,
    all,
  }
}
