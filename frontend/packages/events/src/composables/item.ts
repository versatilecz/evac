import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { $Event } from '../definitions'
import { useEvents } from './list'

export function useEvent(uuid: MaybeRefOrGetter<$Event['uuid']>) {
  const { data } = useEvents()
  const event = computed(() => data.value.get(toValue(uuid)) ?? null)

  return {
    event,
  }
}
