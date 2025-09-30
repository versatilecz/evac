export type AsyncIter<T> = AsyncIterator<T> | AsyncIterable<T>

export function isAsyncIterable<T>(value: unknown): value is AsyncIterable<T> {
  return typeof value === 'object' && value !== null && Symbol.asyncIterator in value
}

export function isAsyncIterator<T>(value: unknown): value is AsyncIterator<T> {
  return (
    typeof value === 'object' && value !== null && 'next' in value && typeof (value as { next: unknown }).next === 'function'
  )
}
