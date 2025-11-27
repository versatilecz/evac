import { logger } from '@evac/shared'
import * as Rx from 'rxjs'
import * as def from '@/definitions'
import * as service from '@/service'

//#region User Info
export const userInfo$ = Rx.from(service.userInfo).pipe(Rx.shareReplay(1))
export const isAuthenticated$ = userInfo$.pipe(Rx.map((userInfo) => !!userInfo && checkRoles(def.validRoles, userInfo.roles)))
export const isAdmin$ = Rx.zip(userInfo$, isAuthenticated$).pipe(
  Rx.map(([userInfo, isAuthenticated]) => !!userInfo && isAuthenticated && checkRoles(def.adminRoles, userInfo.roles))
)
export const isService$ = Rx.zip(userInfo$, isAuthenticated$).pipe(
  Rx.map(([userInfo, isAuthenticated]) => !!userInfo && isAuthenticated && checkRoles(def.serviceRoles, userInfo.roles))
)
export const isDashboard$ = Rx.zip(userInfo$, isAuthenticated$).pipe(
  Rx.map(([userInfo, isAuthenticated]) => !!userInfo && isAuthenticated && checkRoles(def.dashboardRoles, userInfo.roles))
)
export const username$ = userInfo$.pipe(Rx.map((userInfo) => (userInfo ? userInfo.username : def.DEFAULT_USERNAME)))
export const uuid$ = userInfo$.pipe(Rx.map((userInfo) => (userInfo ? userInfo.uuid : null)))

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
//#endregion User Info

//#region Token Detail
export const tokenDetail$ = Rx.from(service.tokenDetail).pipe(Rx.shareReplay(1))
export const tokenIsValid$ = tokenDetail$.pipe(Rx.map((tokenDetail) => !!tokenDetail && tokenDetail.isValid))
//#endregion Token Detail

//#region Token

export const token$$ = new Rx.BehaviorSubject<string | null>(null)
export const token$ = token$$.pipe(Rx.filter(Boolean), Rx.take(1))

export const tokenFromDetail$ = Rx.combineLatest([uuid$, tokenDetail$]).pipe(
  Rx.map(([uuid, tokenDetail]) => {
    if (!uuid || !tokenDetail) return null
    return tokenDetail.isValid && tokenDetail.user === uuid && !!tokenDetail.nonce ? tokenDetail.nonce : null
  })
)
//#endregion
