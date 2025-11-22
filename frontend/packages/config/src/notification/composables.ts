import { logger } from '@evac/shared'
import { useObservable } from '@vueuse/rxjs'
import { computed } from 'vue'
import { emailConfig$, setEmailConfig } from './data'
import { $EmailConfig } from './definitions'

export function useNotificationConfig() {
  const data = useObservable(emailConfig$, { onError: logger.error })

  return computed({
    get: () => data.value,
    set: (value: $EmailConfig) => {
      setEmailConfig($EmailConfig.parse(value)).catch(logger.error)
    },
  })
}
