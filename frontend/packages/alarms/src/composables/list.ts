import { $SortDirection, applyFilters, logger, sortByRules, type $SortRule } from '@evac/shared'
import { formatCount } from '@evac/utils'
import { useObservable } from '@vueuse/rxjs'
import { pipe } from 'remeda'
import { from } from 'rxjs'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { $Alarm } from '@/definitions'
import { service } from '@/service'

type Options = {
  sort?: MaybeRefOrGetter<$SortRule[] | $SortRule>
}

export const DEFAULT_SORT: $SortRule = { key: 'name', direction: $SortDirection.enum.Ascending }

export function useAlarms({ sort = [DEFAULT_SORT] }: Options = {}) {
  const data = useObservable(from(service), { onError: logger.error, initialValue: new Map<string, $Alarm>() })
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
