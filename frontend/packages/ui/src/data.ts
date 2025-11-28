import * as Rx from 'rxjs'

export const debugEnabled$$ = new Rx.BehaviorSubject<boolean | null>(false)
