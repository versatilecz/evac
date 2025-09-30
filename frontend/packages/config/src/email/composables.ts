import { logger } from '@evac/shared'
import { useObservable } from '@vueuse/rxjs'
import { computed } from 'vue'
import { emailConfig$, setEmailConfig } from './data'
import type { $EmailConfig } from './definitions'

export function useEmailConfig() {
  const data = useObservable(emailConfig$, { onError: logger.error })

  return computed({
    get: () => data.value,
    set: (value: $EmailConfig) => {
      setEmailConfig(value).catch(logger.error)
    },
  })
}
