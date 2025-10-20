type FromEventOptions = Omit<AddEventListenerOptions, 'once'> & { signal?: AbortSignal }

export function asyncIterableFromEvent<T extends Event>(target: EventTarget, eventName: string, options?: FromEventOptions): AsyncIterable<T> {
  const { signal, ...opts } = options ?? {}

  return {
    [Symbol.asyncIterator]() {
      return {
        next() {
          return new Promise((resolve) => {
            if (signal?.aborted) {
              resolve({ value: undefined, done: true })
              return
            }

            target.addEventListener(eventName, eventHandler as (event: unknown) => void, { ...opts, once: true })
            signal?.addEventListener('abort', () => resolve({ value: undefined, done: true }), { once: true })

            function eventHandler(event: T) {
              resolve({ value: event, done: false })
            }
          })
        },
      }
    },
  }
}
