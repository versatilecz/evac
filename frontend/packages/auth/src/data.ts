import { BehaviorSubject } from 'rxjs'
import type { Auth } from './definitions'

export const isAuthenticated$$ = new BehaviorSubject<boolean>(true)
export const isAdmin$$ = new BehaviorSubject<boolean>(true)
export const isDebug$$ = new BehaviorSubject<boolean>(false)
export const isUser$$ = new BehaviorSubject<boolean>(true)
export const isExternal$$ = new BehaviorSubject<boolean>(false)

export function getAuth(): Auth {
  return {
    isAuthenticated: isAuthenticated$$.value,
    isAdmin: isAdmin$$.value,
    isDebug: isDebug$$.value,
    isUser: isUser$$.value,
    isExternal: isExternal$$.value,
  }
}
