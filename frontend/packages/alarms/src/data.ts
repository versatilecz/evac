import * as Rx from 'rxjs'
import { service, activeAlarmService } from '@/service'

export const alarms$ = Rx.from(service).pipe(Rx.shareReplay(1))
export const activeAlarm$ = Rx.from(activeAlarmService)
