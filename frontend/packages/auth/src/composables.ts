
import { useObservable, useSubject } from '@vueuse/rxjs'
import { logger } from '@evac/shared'
import { computed, type ComputedRef, type Ref } from 'vue'
import type { Auth } from '@/definitions'
import { auth$, debugEnabled$$, defaultAuth } from '@/data'

type UseAuthReturn = {
  auth: Ref<Auth>
  debugEnabled: Ref<boolean>
  isAuthenticated: ComputedRef<boolean>
  isAdmin: ComputedRef<boolean>
  isDebug: ComputedRef<boolean>
  isService: ComputedRef<boolean>
  isDashboard: ComputedRef<boolean>
}

export function useAuth(): UseAuthReturn {
  const auth = useObservable(auth$, { onError: logger.error, initialValue: defaultAuth() })
  const debugEnabled = useSubject(debugEnabled$$, { onError: logger.error })
  const isAuthenticated = computed(() => auth.value.isAuthenticated)
  const isAdmin = computed(() => auth.value.isAdmin)
  const isDebug = computed(() => auth.value.isDebug)
  const isService = computed(() => auth.value.isService)
  const isDashboard = computed(() => auth.value.isDashboard)

  return {
    auth,
    debugEnabled,
    isAuthenticated,
    isAdmin,
    isDebug,
    isService,
    isDashboard,
  }
}
