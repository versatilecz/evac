import * as Rx from 'rxjs'
import { service } from '@/service'

export const activity$ = Rx.from(service)
