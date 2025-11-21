import { syncStorageWithSubject } from '@evac/utils'
import { toReactive } from '@vueuse/core'
import type { Storage } from 'unstorage'
import { type App, type Reactive } from 'vue'
import { debugEnabled$$ } from './data'
import { useAuth } from '@/composables'
import type { Auth } from '@/definitions'

// Augment Vue's component instance type
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $auth: Reactive<Auth>
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $auth: Reactive<Auth>
  }
}

type PluginOptions = {
  storage: Storage
}

export function createAuth({ storage }: PluginOptions) {
  return function authPlugin(app: App) {
    const subscriptions = [syncStorageWithSubject<boolean>(storage, 'debug', debugEnabled$$)]
    const { auth } = useAuth()

    app.config.globalProperties.$auth = toReactive(auth)

    return () => {
      return Promise.all(subscriptions.map((x) => x.then((y) => y.unsubscribe())))
    }
  }
}
