import * as Rx from 'rxjs'
import { service, activeAlarmService } from '@/service'

export const alarms$ = Rx.from(service)
export const activeAlarm$ = Rx.from(activeAlarmService)
