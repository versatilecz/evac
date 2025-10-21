import { abortable, asyncIterableFromEvent, defer, mergeAsyncIterables, mergeSignals, toPromise } from '@evac/utils'
import type { Observable } from 'rxjs'
import { prefixStorage, type Storage } from 'unstorage'
import type { ZodType } from 'zod'
import { logger as defaultLogger } from './logger'
import type { WebSocketConnection } from './websocket/definitions'

const ACTION_TIMEOUT = 5000

const STORAGE_KEY = {
  STATE: 'state',
} as const

export type WebSocketService<C extends ServiceConfig<any> = ServiceConfig<any>> = {} & ServiceBase<NoInfer<C>> &
  ServiceListeners<NoInfer<C>> &
  AsyncIterable<FromConfig<NoInfer<C>>> &
  Disposable

export type ServiceConfig<T> = {
  name: string
  identity: ZodType<T>
  logger?: Console
  storage?: Storage | StorageFactory
  maxRetries?: number
}

type StorageFactory = (storage: Storage) => Storage

type DataSource<C extends ServiceConfig<unknown>> = (this: WebSocketService<C>, source: WebSocketConnection<unknown>) => AsyncIterable<FromConfig<C>>
type FromConfig<C extends ServiceConfig<unknown>> = C extends ServiceConfig<infer T> ? T : never

type ServiceListeners<C extends ServiceConfig<unknown>> = EventTarget & {
  addEventListener(type: 'data', listener: (this: WebSocketService<C>, event: CustomEvent<FromConfig<C>>) => unknown, options?: boolean | AddEventListenerOptions): void
  removeEventListener(type: 'data', listener: (this: WebSocketService<C>, event: CustomEvent<FromConfig<C>>) => unknown, options?: boolean | EventListenerOptions): void
  dispatchEvent(event: Event): boolean
}

export type ServiceBase<C extends ServiceConfig<unknown>> = {
  readonly name: string
  get: () => Promise<FromConfig<C> | undefined>
  set(value: Partial<FromConfig<C>>, source: Promise<FromConfig<C>> | AsyncIterable<FromConfig<C>> | FromConfig<C>): Promise<void>
  set(value: FromConfig<C>): Promise<void>
  start: (payload: CreateServicePayload<FromConfig<C>>) => Disposable & { name: string; stop: () => void }
  stop: () => void
  withActions<A extends ActionDefinitions<C>>(actions: A): WebSocketService<C> & ServiceActions<A>
  withSources(...newSources: DataSource<ServiceConfig<FromConfig<C>>>[]): WebSocketService<C>
}

type CreateServicePayload<T> = {
  connection: WebSocketConnection<T>
  source: AsyncIterable<NoInfer<T>> | AsyncIterable<NoInfer<T>>[]
  storage?: Storage
  signal?: AbortSignal
}

export type ServiceActions<A extends ActionDefinitions<any>> = {
  [K in keyof A]: A[K] extends (source: any, ...args: infer P) => infer R ? (...args: P) => R extends Promise<any> ? R : Promise<R> : never
}

type ActionDefinitions<C extends ServiceConfig<unknown>> = {
  [key: string]: Action<C>
}

type Action<C extends ServiceConfig<unknown>> = (this: WebSocketService<C>, source: WebSocketConnection<FromConfig<C>>, ...args: any[]) => any

export function defineService<C extends ServiceConfig<any>>(config: C): WebSocketService<C> {
  const { name, identity, storage: storageOrFactory, logger = defaultLogger } = config
  // Use the provided storage factory or create a namespaced storage using the service name
  const setStorage = typeof storageOrFactory === 'function' ? storageOrFactory : (x: Storage) => prefixStorage(x, name)

  // In case storage is not provided initially, it can be set later when starting the service
  let storage: Storage | undefined = typeof storageOrFactory === 'object' && storageOrFactory ? storageOrFactory : undefined
  let abortController = new AbortController()
  let abortSignal = abortController.signal
  let started = defer<void>()
  let activeConnection: WebSocketConnection<FromConfig<C>> | null = null
  let sources: DataSource<NoInfer<C>>[] = []

  const eventTarget = new EventTarget() as WebSocketService<C>
  Object.assign(eventTarget, {
    get name() {
      return name
    },
    start: startService,
    stop: dispose,
    get: getFromStorage,
    set: setValue,
    withActions,
    withSources,
    [Symbol.asyncIterator]: startObserving,
    [Symbol.dispose]: dispose,
  } satisfies ServiceBase<NoInfer<C>> & AsyncIterable<FromConfig<NoInfer<C>>> & Disposable)

  return eventTarget

  async function* startObserving() {
    const fromStorage = await getFromStorage()
    if (typeof fromStorage !== 'undefined') {
      yield fromStorage
    }

    try {
      for await (const event of asyncIterableFromEvent<CustomEvent<FromConfig<NoInfer<C>>>>(eventTarget, 'data', {
        signal: abortSignal,
      })) {
        yield identity.parse(event.detail)
      }
    } catch (cause) {
      logger.error(new Error(`[${name}] Error occurred while observing data`, { cause }))
      return startObserving()
    }
  }

  async function getFromStorage() {
    try {
      await started.promise
      if (!storage) return
      const stored = await storage.getItemRaw<FromConfig<NoInfer<C>>>(STORAGE_KEY.STATE)
      if (typeof stored === 'undefined' || stored === null) return
      const parsed = identity.parse(stored)
      return parsed
    } catch (cause) {
      logger.error(new Error(`[${name}] Failed to retrieve stored state`, { cause }))
    }
  }

  function startService({ connection, storage: nextStorage, signal }: CreateServicePayload<FromConfig<NoInfer<C>>>) {
    if (!abortController.signal.aborted) abortController.abort()
    abortController = new AbortController()
    abortSignal = signal ? mergeSignals(abortController.signal, signal) : abortController.signal
    abortSignal.addEventListener('abort', dispose, { once: true })
    activeConnection = connection

    if (nextStorage) {
      storage = setStorage(nextStorage)
    }

    observeAndHandleIncomingData()

    logger.info(`[${name}] service started`)
    started.resolve()

    return Object.freeze({
      name,
      stop: dispose,
      [Symbol.dispose]: dispose,
    })
  }

  async function observeAndHandleIncomingData() {
    for await (const data of abortable(mergeAsyncIterables(...sources.map((x) => connectSource(x))), abortSignal)) {
      await storeValue(data)
      eventTarget.dispatchEvent(new CustomEvent('data', { detail: data }))
      logger.info(`[${name}] received data`, data)
    }

    logger.warn(`[${name}] observation ended`)
  }

  async function* connectSource(dataSource: DataSource<ServiceConfig<FromConfig<NoInfer<C>>>>) {
    if (!dataSource) return

    if (!activeConnection) {
      throw new Error(`[${name}] Cannot connect data source - no active connection`)
    }

    yield* dataSource.call(eventTarget, activeConnection)
  }

  function dispose() {
    if (!abortController.signal.aborted) abortController.abort()

    started = defer<void>()
    abortSignal.removeEventListener('abort', dispose)
    storage = undefined
    sources = []
    activeConnection = null

    logger.warn(`[${name}] service stopped`)
  }

  async function setValue(
    value: Partial<FromConfig<NoInfer<C>>>,
    source?: Observable<FromConfig<NoInfer<C>>> | Promise<FromConfig<NoInfer<C>>> | AsyncIterable<FromConfig<NoInfer<C>>> | FromConfig<NoInfer<C>>
  ): Promise<void> {
    const sourceData = await toPromise(source, mergeSignals(abortController.signal, AbortSignal.timeout(ACTION_TIMEOUT)))
    const next = Object.assign(sourceData ?? {}, value)
    await storeValue(identity.parse(next))
  }

  async function storeValue(value: FromConfig<NoInfer<C>>) {
    if (storage) {
      await storage.setItemRaw(STORAGE_KEY.STATE, value as never).catch((cause) => logger.error(new Error(`[${name}] Failed to save state`, { cause })))
    }
  }

  function withActions<A extends ActionDefinitions<C>>(actions: A): WebSocketService<C> & ServiceActions<A> {
    for (const [actionName, actionImpl] of Object.entries(actions) as [string, (...args: any[]) => unknown][]) {
      Object.defineProperty(eventTarget, actionName, {
        value: async (...args: any[]) => {
          if (!activeConnection) {
            await started.promise
          }
          if (!activeConnection) {
            throw new Error(`[${name}] Cannot perform action "${actionName}" - service is not started`)
          }
          const result = actionImpl.call(eventTarget, activeConnection, ...args)
          return result
        },
        enumerable: false,
      })
    }

    return eventTarget as WebSocketService<C> & ServiceActions<A>
  }

  function withSources(...newSources: DataSource<ServiceConfig<FromConfig<C>>>[]): WebSocketService<C> {
    sources.push(...newSources)
    return eventTarget
  }
}
