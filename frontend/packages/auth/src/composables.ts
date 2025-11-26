import { useObservable } from '@vueuse/rxjs'
import { logger } from '@evac/shared'
import { type Ref } from 'vue'
import * as def from '@/definitions'
import * as data from '@/data'

type UseAuthReturn = {
  isAuthenticated: Readonly<Ref<boolean>>
  isAdmin: Readonly<Ref<boolean>>
  isService: Readonly<Ref<boolean>>
  isDashboard: Readonly<Ref<boolean>>
  username: Readonly<Ref<string>>
}

export function useAuth(): UseAuthReturn {
  const isAuthenticated = useObservable(data.isAuthenticated$, { onError: logger.error, initialValue: false })
  const isAdmin = useObservable(data.isAdmin$, { onError: logger.error, initialValue: false })
  const isService = useObservable(data.isService$, { onError: logger.error, initialValue: false })
  const isDashboard = useObservable(data.isDashboard$, { onError: logger.error, initialValue: false })
  const username = useObservable(data.username$, { onError: logger.error, initialValue: def.DEFAULT_USERNAME })

  return {
    isAuthenticated,
    isAdmin,
    isService,
    isDashboard,
    username,
  }
}
