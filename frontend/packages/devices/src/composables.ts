import { logger } from '@evac/shared'
import { useObservable } from '@vueuse/rxjs'
import { computed, type MaybeRefOrGetter } from 'vue'
import { from } from 'rxjs'
import type { $Device } from './definitions'
import { service } from './service'

type UseDevicesOptions = {
  location?: MaybeRefOrGetter<string | null | undefined>
  room?: MaybeRefOrGetter<string | null | undefined>
  unlocated?: MaybeRefOrGetter<boolean>
}

export function useDevices(options: UseDevicesOptions = {}) {
  void options // currently unused
  const data = useObservable(from(service), { onError: logger.error, initialValue: new Map<string, $Device>() })
  const list = computed(() => [...data.value.values()])

  return {
    list,
  }

  // function* filterByLocation(devices: Iterable<$Device>, location: string | null) {
  //   for (const device of devices) {
  //     if (location && device.location !== location) continue
  //     yield device
  //   }
  // }
}
