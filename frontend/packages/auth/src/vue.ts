import { logger } from '@evac/shared'
import { syncStorageWithSubject } from '@evac/utils'
import { useSubject } from '@vueuse/rxjs'
import type { Storage } from 'unstorage'
import { inject, readonly, ref, type App, type Ref, type ToRefs } from 'vue'
import { isAuthenticated$$, isAdmin$$, isDebug$$, isUser$$, isExternal$$ } from './data'
import type { Auth } from './definitions'

// Augment Vue's component instance type
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $auth: ToRefs<Auth>
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $auth: ToRefs<Auth>
  }
}

const SYMBOL = {
  DEBUG: Symbol('auth:debug'),
  ADMIN: Symbol('auth:admin'),
  AUTH: Symbol('auth:auth'),
  USER: Symbol('auth:user'),
  EXTERNAL: Symbol('auth:external'),
} as const

type PluginOptions = {
  storage: Storage
}

export function createAuth({ storage }: PluginOptions) {
  return function authPlugin(app: App) {
    const subscriptions = [syncStorageWithSubject<boolean>(storage, 'debug', isDebug$$)]

    const isAuthenticated = useSubject(isAuthenticated$$, { onError: logger.error })
    const isAdmin = useSubject(isAdmin$$, { onError: logger.error })
    const isDebug = useSubject(isDebug$$, { onError: logger.error })
    const isUser = useSubject(isUser$$, { onError: logger.error })
    const isExternal = useSubject(isExternal$$, { onError: logger.error })

    const auth = {
      isAuthenticated,
      isAdmin,
      isDebug,
      isUser,
      isExternal,
    } satisfies ToRefs<Auth>

    app.config.globalProperties.$auth = auth
    app.provide(SYMBOL.AUTH, isAuthenticated)
    app.provide(SYMBOL.ADMIN, isAdmin)
    app.provide(SYMBOL.DEBUG, isDebug)
    app.provide(SYMBOL.USER, isUser)
    app.provide(SYMBOL.EXTERNAL, isExternal)

    return () => {
      return Promise.all(subscriptions.map((x) => x.then((y) => y.unsubscribe())))
    }
  }
}

export function useAuth(): ToRefs<Auth> {
  const isDebug = inject<Ref<boolean>>(SYMBOL.DEBUG, readonly(ref(false)))
  const isAuthenticated = inject<Ref<boolean>>(SYMBOL.AUTH, readonly(ref(false)))
  const isAdmin = inject<Ref<boolean>>(SYMBOL.ADMIN, readonly(ref(false)))
  const isUser = inject<Ref<boolean>>(SYMBOL.USER, readonly(ref(false)))
  const isExternal = inject<Ref<boolean>>(SYMBOL.EXTERNAL, readonly(ref(false)))

  return {
    isAdmin,
    isAuthenticated,
    isDebug,
    isUser,
    isExternal,
  }
}
