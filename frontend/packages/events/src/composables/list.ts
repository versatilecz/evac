import { applyFilters, logger, sortByRules, type $SortRule } from '@evac/shared'
import { formatCount } from '@evac/utils'
import { useObservable } from '@vueuse/rxjs'
import { pipe } from 'remeda'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { events$ } from '../data'
import { DEFAULT_SORT, type $Event } from '../definitions'

type Options = {
  sort?: MaybeRefOrGetter<$SortRule[] | $SortRule>
}

export function useEvents(options: Options = {}) {
  const { sort = [DEFAULT_SORT] } = options

  const data = useObservable(events$, { onError: logger.error, initialValue: new Map<string, $Event>() })
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
