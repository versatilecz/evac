import { syncStorageWithSubject } from '@evac/shared'
import type { Storage } from 'unstorage'
import { debugEnabled$$ } from '@/data'

type Options = {
  storage: Storage
}

export function plugin({ storage }: Options) {
  return function uiPlugin() {
    const subscriptions = [syncStorageWithSubject<boolean>(storage, 'debug', debugEnabled$$)]

    return () => {
      return Promise.all(subscriptions.map((x) => x.then((y) => y.unsubscribe())))
    }
  }
}
