import * as Rx from 'rxjs'
import { service } from '@/service'
import * as def from './definitions'

export const userInfo$ = Rx.from(service).pipe(Rx.shareReplay(1))
export const debugEnabled$$ = new Rx.BehaviorSubject<boolean>(false)
export const auth$ = Rx.combineLatest([userInfo$, debugEnabled$$]).pipe(
  Rx.map(([userInfo, debugEnabled]) => authFromUserInfo(userInfo, debugEnabled)),
)

export function authFromUserInfo(userInfo: def.UserInfo | null | undefined, debugEnabled: boolean): def.Auth {
  const isAuthenticated = !!userInfo && checkRoles(def.validRoles, userInfo.roles)
  if (!isAuthenticated) return defaultAuth()

  return {
    isAuthenticated,
    isAdmin: checkRoles(def.adminRoles, userInfo.roles),
    isDebug: checkRoles(def.adminRoles, userInfo.roles) && debugEnabled,
    isService: checkRoles(def.serviceRoles, userInfo.roles),
    isDashboard: checkRoles(def.dashboardRoles, userInfo.roles),
  }
}

function checkRoles(rule: Set<def.Role>, userRoles: Set<def.Role>): boolean {
  for (const role of rule) {
    if (!userRoles.has(role)) continue
    return true
  }
  return false
}

export function defaultAuth(): def.Auth {
  return {
    isAuthenticated: false,
    isAdmin: false,
    isDebug: false,
    isService: false,
    isDashboard: false,
  }
}
