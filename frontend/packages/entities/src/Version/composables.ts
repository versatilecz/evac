import { logger } from '@evac/shared'
import { useObservable } from '@vueuse/rxjs'

import { state$ } from './data'

export function useState() {
  const backend = useObservable(state$, { onError: logger.error, initialValue: null })

  return {
    backend,
  }
}
