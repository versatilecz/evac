import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useNotifications } from './list'
import type { $Notification } from '@/definitions'

export function useNotification(uuid: MaybeRefOrGetter<$Notification['uuid']>) {
  const { data } = useNotifications()
  const notification = computed(() => data.value.get(toValue(uuid)) ?? null)

  return {
    notification,
  }
}
