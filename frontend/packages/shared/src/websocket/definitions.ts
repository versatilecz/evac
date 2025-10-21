export type WebSocketRetryOptions = {
  /** The maximum number of retry attempts */
  count: number
  /** The delay between retry attempts */
  delay: number
}

/* Options for the WebSocket connection */
export type WebSocketConnectionOptions = {
  parser?: (data: string) => unknown
  /** Indicates whether the connection should automatically reconnect */
  reconnect?: boolean
  /** Retry options for the connection */
  retry?: WebSocketRetryOptions
  /** Optional AbortSignal to cancel the connection */
  signal?: AbortSignal
}

export type WebSocketConnection<T> = EventTarget &
  Disposable &
  AsyncIterable<T> & {
    /** The current ready state of the WebSocket connection */
    readonly readyState: number
    /** Sends data through the WebSocket connection */
    send(data: unknown): void
  }
