import { logger } from '@evac/shared'
import { useSubject } from '@vueuse/rxjs'
import { computed } from 'vue'
import { highlightedDevice$$ } from './data'

export function useHighlightedDevice() {
  const highlightedDevice = useSubject(highlightedDevice$$, { onError: logger.error })

  function isHighlighted(deviceId: string) {
    return computed(() => highlightedDevice.value === deviceId)
  }

  function highlightDevice(deviceId: string | null) {
    highlightedDevice.value = deviceId
  }

  return {
    highlightedDevice,
    isHighlighted,
    highlightDevice,
  }
}
