import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useAlarms } from './list'
import type { $Alarm } from '@/definitions'

export function useAlarm(uuid: MaybeRefOrGetter<$Alarm['uuid']>) {
  const { data } = useAlarms()
  const alarm = computed(() => data.value.get(toValue(uuid)) ?? null)

  return {
    alarm,
  }
}
