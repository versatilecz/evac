import { logger } from '@evac/shared'
import { syncStorageWithSubject } from '@evac/utils'
import { useSubject } from '@vueuse/rxjs'
import type { Storage } from 'unstorage'
import { inject, type App, type Ref, type ToRefs } from 'vue'
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
  const isDebug = inject<Ref<boolean>>(SYMBOL.DEBUG)
  const isAuthenticated = inject<Ref<boolean>>(SYMBOL.AUTH)
  const isAdmin = inject<Ref<boolean>>(SYMBOL.ADMIN)
  const isUser = inject<Ref<boolean>>(SYMBOL.USER)
  const isExternal = inject<Ref<boolean>>(SYMBOL.EXTERNAL)

  if (!isDebug || !isAuthenticated || !isAdmin || !isUser || !isExternal) {
    throw new Error('Auth not provided')
  }

  return {
    isAdmin,
    isAuthenticated,
    isDebug,
    isUser,
    isExternal,
  }
}
