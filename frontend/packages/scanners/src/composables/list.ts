import { $SortDirection, applyFilters, formatCount, logger, sortByRules, type $SortRule } from '@evac/shared'
import { useObservable } from '@vueuse/rxjs'
import { pipe } from 'remeda'
import { from } from 'rxjs'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { $Scanner } from '@/definitions'
import { service } from '@/service'

type Options = {
  sort?: MaybeRefOrGetter<$SortRule[] | $SortRule>
}

export const DEFAULT_SORT: $SortRule = { key: 'name', direction: $SortDirection.enum.Ascending }

export function useScanners({ sort = [DEFAULT_SORT] }: Options = {}) {
  const data = useObservable(from(service), { onError: logger.error, initialValue: new Map<string, $Scanner>() })
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
