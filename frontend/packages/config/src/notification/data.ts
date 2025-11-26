import * as Rx from 'rxjs'
import { service } from '../service'
import { $EmailConfig, $NotificationConfig } from './definitions'

export const notificationConfig$ = Rx.from(service).pipe(Rx.map((data) => data.notification), Rx.shareReplay(1))
export const emailConfig$ = notificationConfig$.pipe(Rx.map((data) => data.email), Rx.shareReplay(1))

export async function setEmailConfig(email: $EmailConfig) {
  const state = await service.get()
  if (!state) throw new Error('Cannot set email config: service state is undefined')
  return service.set({ ...state, notification: { ...state.notification, email: $EmailConfig.parse(email) } })
}

export async function setNotificationConfig(notification: Partial<$NotificationConfig>) {
  const state = await service.get()
  if (!state) throw new Error('Cannot set notification config: service state is undefined')
  return service.set({ ...state, notification: { ...state.notification, ...notification } })
}
