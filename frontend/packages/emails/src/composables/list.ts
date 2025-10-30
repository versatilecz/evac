import { applyFilters, logger, sortByRules, type $SortRule } from '@evac/shared'
import { useAction } from '@evac/ui'
import { formatCount } from '@evac/utils'
import { useObservable } from '@vueuse/rxjs'
import { pipe } from 'remeda'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { emails$ } from '@/data'
import { DEFAULT_SORT, $Email } from '@/definitions'
import { service } from '@/service'

type Options = {
  sort?: MaybeRefOrGetter<$SortRule[] | $SortRule>
}

export function useEmails({ sort = [DEFAULT_SORT] }: Options = {}) {
  const data = useObservable(emails$, { onError: logger.error, initialValue: new Map<string, $Email>() })
  const all = computed(() => [...data.value.values()])
  const list = computed(() => pipe(data.value.values(), applyFilters([]), sortByRules(toValue(sort))))
  const count = computed(() => formatCount(data.value.size, list.value.length))

  return {
    count,
    data,
    list,
    all,
    send: useAction(service.send),
  }
}
