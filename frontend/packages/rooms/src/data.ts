import * as Rx from 'rxjs'
import { service } from '@/service'

export const rooms$ = Rx.from(service)
