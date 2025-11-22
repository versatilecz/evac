import { formatCount, logger, sortByRules, type SortRule } from '@evac/shared'
import { useObservable } from '@vueuse/rxjs'
import { pipe } from 'remeda'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { activity$ } from './data'
import { DEFAULT_SORT, type $Activity } from './definitions'

type Options = {
  sort?: MaybeRefOrGetter<SortRule[] | SortRule>
}

export function useActivity({ sort = [DEFAULT_SORT] }: Options = {}) {
  const data = useObservable(activity$, { onError: logger.error, initialValue: new Map<string, $Activity>() })
  const all = computed(() => [...data.value.values()])
  const list = computed(() => pipe(data.value.values(), sortByRules(toValue(sort))))
  const count = computed(() => formatCount(data.value.size, list.value.length))

  return {
    count,
    data,
    list,
    all,
  }
}

export function useActivityOnDevice(device: MaybeRefOrGetter<string>) {
  const { data } = useActivity()
  const activity = computed(() => data.value.get(toValue(device)) ?? null)

  return {
    activity,
  }
}
