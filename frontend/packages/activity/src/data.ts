import * as Rx from 'rxjs'
import { service } from '@/service'

export const activity$ = Rx.from(service).pipe(Rx.shareReplay(1))

export const devicesByScanner$ = activity$.pipe(Rx.map((x) => Map.groupBy(x.values(), (activity) => activity.scanner)))
