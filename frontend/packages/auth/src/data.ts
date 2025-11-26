import * as Rx from 'rxjs'
import { service } from '@/service'
import * as def from './definitions'
import { logger } from '@evac/shared'

export const userInfo$ = Rx.from(service).pipe(Rx.shareReplay(1))
export const isAuthenticated$ = userInfo$.pipe(
  Rx.map(userInfo => !!userInfo && checkRoles(def.validRoles, userInfo.roles)),
)
export const isAdmin$ = Rx.zip(userInfo$, isAuthenticated$).pipe(
  Rx.map(([userInfo, isAuthenticated]) => !!userInfo && isAuthenticated && checkRoles(def.adminRoles, userInfo.roles)),
)
export const isService$ = Rx.zip(userInfo$, isAuthenticated$).pipe(
  Rx.map(([userInfo, isAuthenticated]) => !!userInfo && isAuthenticated && checkRoles(def.serviceRoles, userInfo.roles)),
)
export const isDashboard$ = Rx.zip(userInfo$, isAuthenticated$).pipe(
  Rx.map(([userInfo, isAuthenticated]) => !!userInfo && isAuthenticated && checkRoles(def.dashboardRoles, userInfo.roles)),
)
export const username$ = userInfo$.pipe(
  Rx.map(userInfo => (userInfo ? userInfo.username : def.DEFAULT_USERNAME)),
)

function checkRoles(rule: Set<def.Role>, userRoles: Set<def.Role>): boolean {
  try {
    for (const role of rule) {
      if (!userRoles.has(role)) continue
      return true
    }
    return false
  } catch (e) {
    logger.error(e)
    return false
  }
}
