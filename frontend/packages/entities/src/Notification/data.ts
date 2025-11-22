import * as Rx from 'rxjs'
import { service } from './service'

export const state$ = Rx.from(service).pipe(Rx.shareReplay(1))
