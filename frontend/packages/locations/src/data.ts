import * as Rx from 'rxjs'
import { service } from '@/service'

export const locations$ = Rx.from(service).pipe(Rx.shareReplay(1))
