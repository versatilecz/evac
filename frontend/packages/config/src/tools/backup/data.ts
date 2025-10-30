import * as Rx from 'rxjs'
import { service } from './service'

export const backup$ = Rx.from(service)
