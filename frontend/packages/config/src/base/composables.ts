import { logger } from '@evac/shared'
import { useObservable } from '@vueuse/rxjs'
import { computed } from 'vue'
import { baseConfig$, setBaseConfig } from './data'
import type { $BaseConfig } from './definitions'

export function useBaseConfig() {
  const data = useObservable(baseConfig$, { onError: logger.error })

  return computed({
    get: () => data.value,
    set: (value: $BaseConfig) => {
      setBaseConfig(value).catch(logger.error)
    },
  })
}
