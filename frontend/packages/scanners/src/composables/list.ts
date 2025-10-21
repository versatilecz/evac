import { applyFilters, logger, sortByRules } from '@evac/shared'
import { useObservable } from '@vueuse/rxjs'
import { pipe } from 'remeda'
import { from } from 'rxjs'
import { computed } from 'vue'
import { $Scanner } from '@/definitions'
import { service } from '@/service'

export function useScanners() {
  const data = useObservable(from(service), { onError: logger.error, initialValue: new Map<string, $Scanner>() })
  const all = computed(() => [...data.value.values()])
  const list = computed(() => pipe(all.value, applyFilters([]), sortByRules([])))
  const count = computed(() => data.value.size)

  return {
    count,
    data,
    list,
    all,
  }
}
