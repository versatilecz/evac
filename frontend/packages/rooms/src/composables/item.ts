import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useRooms } from './list'

export function useRoom(uuid: MaybeRefOrGetter<string | null | undefined>) {
  const { data } = useRooms()
  const room = computed(() => {
    const currentUuid = toValue(uuid)
    return currentUuid ? (data.value.get(currentUuid) ?? null) : null
  })

  return {
    room,
  }
}
