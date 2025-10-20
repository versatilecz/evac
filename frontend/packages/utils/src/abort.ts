export function mergeSignals(...signals: (AbortSignal | undefined | null)[]): AbortSignal {
  const validSignals = signals.filter((signal): signal is AbortSignal => signal != null)

  if (validSignals.length === 0) {
    throw new TypeError('At least one AbortSignal is required to merge.')
  }
  if (validSignals.length === 1) {
    return validSignals[0]!
  }

  const controller = new AbortController()

  const onAbort = () => {
    controller.abort()
    validSignals.forEach((signal) => signal.removeEventListener('abort', onAbort))
  }

  for (const signal of validSignals) {
    if (signal.aborted) {
      onAbort()
    } else {
      signal.addEventListener('abort', onAbort, { once: true })
    }
  }

  return controller.signal
}
