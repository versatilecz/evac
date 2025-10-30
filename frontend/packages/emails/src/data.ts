import * as Rx from 'rxjs'
import { service } from '@/service'

export const emails$ = Rx.from(service)
