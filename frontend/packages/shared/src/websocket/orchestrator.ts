import type { Storage } from 'unstorage'

import { logger } from '../logger'
import type { WebSocketService } from '../service'
import { connectToWebSocket } from './connect'
import type { WebSocketConnection } from './definitions'

type OrchestratorConfig = {
  url: URL | string
  services?: Iterable<WebSocketService>
  storage: Storage
}

export type MessageParser = (source: AsyncIterable<object>) => AsyncIterable<object>

const RECONNECT_DELAY = 1000

export function defineWebSocketServices(...services: WebSocketService[]): Set<WebSocketService> {
  return new Set<WebSocketService>(services)
}

export async function orchestrateWebSocketAndServices(config: OrchestratorConfig): Promise<void> {
  const abortController = new AbortController()
  const runningServices = new Set<Disposable>()
  try {
    const { services, storage, url } = config

    using connection = connectToWebSocket<object>(url, { reconnect: true })
    await waitForConnectionToOpen(connection)
    logger.log('[ws] connection established')

    for (const service of services ?? []) {
      runningServices.add(service.start({ connection, source: connection, storage, signal: abortController.signal }))
    }

    await listen(connection)
    throw new Error('[ws] connection closed')
  } catch (e) {
    logger.error(e)
    abortController.abort()
    runningServices.forEach((x) => x[Symbol.dispose]())
    runningServices.clear()
    return reconnect()
  }

  async function reconnect(): Promise<void> {
    logger.info(`[ws] waiting ${RECONNECT_DELAY}ms before reconnecting...`)
    await new Promise((resolve) => setTimeout(resolve, RECONNECT_DELAY))
    logger.info('[ws] attempting to reconnect...')
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
