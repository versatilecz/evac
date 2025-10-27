import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useRooms } from './list'

export function useRoom(uuid: MaybeRefOrGetter<string>) {
  const { data } = useRooms()
  const room = computed(() => data.value.get(toValue(uuid)) ?? null)

  return {
    room,
  }
}
