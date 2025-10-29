import { applyFilters, logger, sortByRules, type $SortRule } from '@evac/shared'
import { formatCount } from '@evac/utils'
import { useObservable } from '@vueuse/rxjs'
import { pipe } from 'remeda'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { scanners$ } from '@/data'
import { DEFAULT_SORT, $Scanner } from '@/definitions'

type Options = {
  sort?: MaybeRefOrGetter<$SortRule[] | $SortRule>
}

export function useScanners({ sort = [DEFAULT_SORT] }: Options = {}) {
  const data = useObservable(scanners$, { onError: logger.error, initialValue: new Map<string, $Scanner>() })

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
