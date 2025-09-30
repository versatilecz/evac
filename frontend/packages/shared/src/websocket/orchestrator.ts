import type { Storage } from 'unstorage'

import { logger } from '../logger'
import type { AppService } from '../service'
import { connectToWebSocket, type WebSocketConnection } from './connect'

type OrchestratorConfig = {
  url: URL | string
  services?: Map<AppService, MessageParser> | Iterable<AppService>
  storage: Storage
}

export type MessageParser = (source: AsyncIterable<object>) => AsyncIterable<object>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function defineWebSocketServices(...services: [AppService<any>, MessageParser][]): Map<AppService, MessageParser> {
  return new Map<AppService, MessageParser>(services as [AppService, MessageParser][])
}

export async function orchestrateWebSocketAndServices(config: OrchestratorConfig) {
  const abortController = new AbortController()
  const runningServices = new Set<Disposable>()
  try {
    const { services, storage, url } = config

    using connection = connectToWebSocket<object>(url, { reconnect: true })
    await waitForConnectionToOpen(connection)
    logger.log('[ws] connection established')

    if (services instanceof Map) {
      for (const [service, parser] of services) {
        runningServices.add(service.start({ source: parser(connection), storage, signal: abortController.signal }))
      }
    } else {
      for (const service of services ?? []) {
        runningServices.add(service.start({ source: connection, storage, signal: abortController.signal }))
      }
    }

    await listen(connection)

    logger.log('[ws] connection closed')
    abortController.abort()
  } catch (e) {
    logger.error('[ws] error:', e)
    abortController.abort()
    runningServices.forEach((x) => x[Symbol.dispose]())
    runningServices.clear()
    return orchestrateWebSocketAndServices(config)
  }
}

function waitForConnectionToOpen(connection: WebSocketConnection<object>): Promise<void> {
  return new Promise((resolve, reject) => {
    if (connection.readyState === WebSocket.OPEN) {
      resolve()
      return
    }

    connection.addEventListener('open', onOpen, { once: true })
    connection.addEventListener('error', onError, { once: true })
    connection.addEventListener('close', onClose, { once: true })

    function cleanup() {
      connection.removeEventListener('open', onOpen)
      connection.removeEventListener('error', onError)
      connection.removeEventListener('close', onClose)
    }

    function onOpen() {
      cleanup()
      resolve()
    }

    function onError() {
      cleanup()
      reject(new Error('[ws] connection error'))
    }

    function onClose() {
      cleanup()
      reject(new Error('[ws] connection closed before open'))
    }
  })
}

async function listen<T extends object>(generator: AsyncIterable<T>) {
  for await (const message of generator) {
    logger.debug('[ws] received message:', message)
  }
}
