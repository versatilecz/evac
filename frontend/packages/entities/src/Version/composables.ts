import { logger } from '@evac/shared'
import { useObservable } from '@vueuse/rxjs'

import { state$ } from './data'

export function useState() {
  const state = useObservable(state$, { onError: logger.error, initialValue: null })

  return {
    state,
  }
}
