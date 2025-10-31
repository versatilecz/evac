import * as Rx from 'rxjs'
import { service } from './service'

export const events$ = Rx.from(service)
