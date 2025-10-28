import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useDevices } from './list'
import type { $Device } from '@/definitions'

export function useDevice(uuid: MaybeRefOrGetter<$Device['uuid']>) {
  const { data } = useDevices()
  const device = computed(() => data.value.get(toValue(uuid)) ?? null)

  return {
    device,
  }
}
