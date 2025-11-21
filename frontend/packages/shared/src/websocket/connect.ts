import type { WebSocketConnection, WebSocketConnectionOptions } from './definitions'

export function connectToWebSocket<T>(url: URL | string, options: WebSocketConnectionOptions = {}): WebSocketConnection<T> {
  const { parser = JSON.parse, reconnect = false, retry = { count: 3, delay: 1000 }, signal = null } = options

  let currentSocket: WebSocket | null = null
  let retryAttempts = 0
  let isDisposed = false
  let reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null

  // This EventTarget will have 'message', 'error', and 'close' events. Also 'failed' event when retries are exhausted.
  const service = new EventTarget() as WebSocketConnection<T>

  Object.defineProperty(service, Symbol.asyncIterator, {
    value: function asyncIterator() {
      return {
        next() {
          return new Promise((resolve, reject) => {
            if (isDisposed) {
              resolve({ value: undefined, done: true })
              return
            }

            service.addEventListener('message', messageHandler, { once: true })
            service.addEventListener('close', closeHandler, { once: true })
            service.addEventListener('error', errorHandler, { once: true })

            function messageHandler(event: Event) {
              clearListeners()
              const customEvent = event as CustomEvent
              resolve({ value: customEvent.detail, done: false })
            }

            function closeHandler() {
              clearListeners()
              resolve({ value: undefined, done: true })
            }

            function errorHandler(event: Event) {
              clearListeners()
              const customEvent = event as CustomEvent
              reject(customEvent.detail)
            }

            function clearListeners() {
              service.removeEventListener('message', messageHandler)
              service.removeEventListener('close', closeHandler)
              service.removeEventListener('error', errorHandler)
            }
          })
        },
      }
    },
  })

  Object.defineProperty(service, Symbol.dispose, {
    value: function dispose() {
      isDisposed = true

      if (reconnectTimeoutId !== null) {
        clearTimeout(reconnectTimeoutId)
        reconnectTimeoutId = null
      }

      if (currentSocket) {
        currentSocket.close(1000, 'Connection disposed')
        currentSocket = null
      }
    },
  })

  // Add utility methods
  Object.defineProperty(service, 'readyState', {
    get(): WebSocketConnection<T>['readyState'] {
      return currentSocket?.readyState ?? WebSocket.CLOSED
    },
  })

  Object.defineProperty(service, 'send', {
    value: function send(data: unknown) {
      if (currentSocket && currentSocket.readyState === WebSocket.OPEN) {
        currentSocket.send(encodeData(data))
      } else {
        throw new Error('WebSocket is not connected')
      }
    } satisfies WebSocketConnection<T>['send'],
  })

  function encodeData(data: unknown) {
    if (typeof data === 'string') return data
    if (data instanceof ArrayBuffer || data instanceof Blob || ArrayBuffer.isView(data)) {
      return data
    }
    return JSON.stringify(data)
  }

  // Initialize the first connection
  createSocket()
  signal?.addEventListener('abort', () => void service[Symbol.dispose]())
  return service

  function createSocket(): WebSocket {
    if (isDisposed) throw new Error('Connection was disposed')

    const socket = new WebSocket(url)
    currentSocket = socket

    socket.onopen = (event) => {
      retryAttempts = 0 // Reset retry count on successful connection
      socket.send(JSON.stringify({ Login: {Login: {"username": "admin", "password": "admin"}}}))
      service.dispatchEvent(new CustomEvent('open', { detail: event }))
    }

    socket.onmessage = (event) => {
      service.dispatchEvent(new CustomEvent('message', { detail: parser(event.data) }))
    }

    socket.onerror = (event) => {
      service.dispatchEvent(new CustomEvent('error', { detail: event }))
    }

    socket.onclose = (event) => {
      service.dispatchEvent(new CustomEvent('close', { detail: event }))

      // Handle reconnection logic
      if (reconnect && !isDisposed && event.code !== 1000) {
        // 1000 = normal closure
        handleReconnection()
      }
    }

    return socket
  }

  function handleReconnection() {
    if (isDisposed || retryAttempts >= retry.count) {
      service.dispatchEvent(
        new CustomEvent('failed', {
          detail: {
            message: `WebSocket connection failed after ${retry.count} retry attempts`,
            attempts: retryAttempts,
          },
        })
      )
      return
    }

    retryAttempts++
    const delay = retry.delay * Math.pow(2, retryAttempts - 1) // Exponential backoff

    service.dispatchEvent(new CustomEvent('retry', { detail: { attempt: retryAttempts, maxAttempts: retry.count, delay } }))

    reconnectTimeoutId = setTimeout(() => {
      try {
        createSocket()
      } catch (error) {
        service.dispatchEvent(new CustomEvent('error', { detail: error }))
      }
    }, delay)
  }
}
