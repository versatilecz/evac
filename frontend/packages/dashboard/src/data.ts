import * as Rx from 'rxjs'

export const highlightedDevice$$ = new Rx.BehaviorSubject<string | null>(null)
