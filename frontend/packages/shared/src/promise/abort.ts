export function withAbort<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) {
    return Promise.reject<T>(new Error('Aborted'))
  }

  return new Promise((resolve, reject) => {
    signal.addEventListener('abort', onAbort, { once: true })

    promise
      .then((value) => void resolve(value))
      .catch((error) => void reject(error))
      .finally(() => void signal.removeEventListener('abort', onAbort))

    function onAbort() {
      reject(new Error('Aborted'))
    }
  })
}
