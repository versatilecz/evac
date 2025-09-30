export function abortable<T>(iterable: AsyncIterable<T>, ...signals: (AbortSignal | undefined | null)[]): AsyncIterable<T> {
  return {
    async *[Symbol.asyncIterator](): AsyncIterator<T> {
      closeOnAbort()
      if (anySignalIsAborted()) return close()

      const iterator = iterable[Symbol.asyncIterator]()

      try {
        // Manual pull loop instead of `for await (const v of it)`
        while (true) {
          if (anySignalIsAborted()) break
          const r = await iterator.next()
          if (r.done) break
          yield r.value
        }
      } finally {
        // Ensure producer is closed if we exit early
        close()
      }

      // Best-effort close; don't await to avoid hanging in handler.
      function close() {
        removeListeners()
        // prettier-ignore
        try { iterator.return?.() } catch { /* empty */ }
      }

      function anySignalIsAborted() {
        return signals.some((signal) => signal?.aborted)
      }

      function closeOnAbort() {
        for (const signal of signals) {
          if (!(signal instanceof AbortSignal)) continue
          signal.addEventListener('abort', close, { once: true })
        }
      }

      function removeListeners() {
        for (const signal of signals) {
          if (!(signal instanceof AbortSignal)) continue
          signal.removeEventListener('abort', close)
        }
      }
    },
  }
}
