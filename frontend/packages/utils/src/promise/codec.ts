import { firstValueFrom, isObservable, type Observable } from 'rxjs'
import { abortable, isAsyncIterable } from '../async'
import { withAbort } from './abort'

const DEFAULT_TIMEOUT = 5000

export function toPromise<T>(
  source: Observable<T> | Promise<T> | AsyncIterable<T> | T | undefined,
  signal: AbortSignal = AbortSignal.timeout(DEFAULT_TIMEOUT)
): Promise<T | undefined> {
  if (isObservable(source)) {
    return withAbort(firstValueFrom(source), signal)
  } else if (source instanceof Promise) {
    return withAbort(source, signal)
  } else if (isAsyncIterable(source)) {
    return abortable(source, signal)
      [Symbol.asyncIterator]()
      .next()
      .then((r: IteratorResult<T, undefined>) =>
        r.done && typeof r.value === 'undefined' ? Promise.reject(new Error('No values in async iterable')) : r.value
      )
  }

  return Promise.resolve(source)
}
