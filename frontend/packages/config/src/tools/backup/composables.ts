import { logger } from '@evac/shared'
import { useAction, useFormat } from '@evac/ui'
import { useObservable } from '@vueuse/rxjs'
import { pipe, sort } from 'remeda'
import { from } from 'rxjs'
import { computed } from 'vue'
import { $Backup } from './definitions'
import { service } from './service'

export function useBackups() {
  const formatter = useFormat()
  const data = useObservable(from(service), { onError: logger.error, initialValue: new Set<$Backup>() })
  const all = computed(() => [...data.value.values()])
  const list = computed(() => pipe([...data.value.values()], sort(formatter.sort.compare)))
  const count = computed(() => formatter.count(data.value.size, list.value.length))

  return {
    count,
    data,
    list,
    all,
  }
}

export function useBackupActions() {
  return {
    remove: useAction(service.remove),
    restore: useAction(service.restore),
    set: useAction(service.set),
  }
}
