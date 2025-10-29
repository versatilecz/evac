import * as Rx from 'rxjs'
import { service } from '@/service'

export const scanners$ = Rx.from(service)
