import * as Auth from '@evac/auth'
import { logger } from '@evac/shared'
import { useSubject } from '@vueuse/rxjs'
import { computed } from 'vue'
import { debugEnabled$$ } from '@/data'

export function useDebug() {
  const state = useSubject(debugEnabled$$, { onError: logger.error })
  const { isAdmin } = Auth.useAuth()
  const enabled = computed(() => state.value && isAdmin.value)

  return {
    state,
    enabled,
  }
}
