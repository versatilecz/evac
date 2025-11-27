import { logger, syncStorageWithSubject } from '@evac/shared'
import type { Storage } from 'unstorage'
import { token$, token$$, tokenFromDetail$ } from '@/data'
import * as service from '@/service'

type Options = {
  storage: Storage
}

export function plugin({ storage }: Options) {
  return function uiPlugin() {
    const promises = [syncStorageWithSubject<string>(storage, 'token', token$$)]

    getTokenFromUrl()

    const subscriptions = [
      token$.subscribe({
        next: (token) => {
          service.userInfo.token(token)
        },
        error: logger.error,
      }),
      tokenFromDetail$.subscribe({
        next(nonce) {
          token$$.next(nonce)
        },
        error: logger.error,
      }),
    ]

    return async () => {
      for (const subscription of subscriptions) {
        subscription.unsubscribe()
      }

      await Promise.all(promises.map((x) => x.then((y) => y.unsubscribe())))
    }
  }
}

function getTokenFromUrl() {
  const paramKey = 'token'
  const urlParams = new URLSearchParams(location.search)
  const token = urlParams.get(paramKey)
  if (token) {
    token$$.next(token)
    urlParams.delete(paramKey)
    const newUrl = location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '') + location.hash
    history.replaceState({}, document.title, newUrl)
    location.replace(newUrl)
  }
}
