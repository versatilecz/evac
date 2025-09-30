import { abortable, asyncIterableFromEvent, defer, mergeAsyncIterables, mergeSignals, toPromise } from '@evac/utils'
import type { Observable } from 'rxjs'
import { prefixStorage, type Storage } from 'unstorage'
import type { ZodType } from 'zod'
import { logger as defaultLogger } from './logger.js'

const ACTION_TIMEOUT = 5000

const STORAGE_KEY = {
  STATE: 'state',
} as const

type StorageFactory = (storage: Storage) => Storage

export type ServiceConfig<T extends object> = {
  name: string
  identity: ZodType<T>
  logger?: Console
  storage?: Storage | StorageFactory
  maxRetries?: number
}

export type CreateServicePayload<T extends object> = {
  source: AsyncIterable<NoInfer<T>> | AsyncIterable<NoInfer<T>>[]
  storage?: Storage
  signal?: AbortSignal
}

export type AppServiceEventTarget<T extends object> = EventTarget & {
  addEventListener(
    type: 'data',
    listener: (this: AppService<T>, event: CustomEvent<T>) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void
  removeEventListener(
    type: 'data',
    listener: (this: AppService<T>, event: CustomEvent<T>) => unknown,
    options?: boolean | EventListenerOptions
  ): void
  dispatchEvent(event: Event): boolean
}

export type AppService<T extends object = object> = AppServiceEventTarget<T> &
  Disposable &
  AsyncIterable<T> & {
    set(value: Partial<NoInfer<T>>, source: Observable<T> | Promise<T> | AsyncIterable<T> | T): Promise<void>
    set(value: NoInfer<T>): Promise<void>
    start: (payload: CreateServicePayload<T>) => Disposable & { name: string }
  }

export function defineService<T extends object>({
  name,
  identity,
  storage: storageOrFactory,
  logger = defaultLogger,
}: ServiceConfig<T>): AppService<NoInfer<T>> {
  // Use the provided storage factory or create a namespaced storage using the service name
  const setStorage = typeof storageOrFactory === 'function' ? storageOrFactory : (x: Storage) => prefixStorage(x, name)

  // In case storage is not provided initially, it can be set later when starting the service
  let storage: Storage | undefined = typeof storageOrFactory === 'object' && storageOrFactory ? storageOrFactory : undefined
  let abortController = new AbortController()
  let abortSignal = abortController.signal
  let sources: AsyncIterable<T>[] = []
  let started = defer<void>()

  const eventTarget = new EventTarget()
  Object.defineProperty(eventTarget, Symbol.asyncIterator, { value: startObserving, enumerable: false })
  Object.defineProperty(eventTarget, Symbol.dispose, { value: dispose, enumerable: false })
  Object.defineProperty(eventTarget, 'start', { value: startService, enumerable: false })
  Object.defineProperty(eventTarget, 'set', { value: setValue, enumerable: false })

  return eventTarget as AppService<T>

  async function* startObserving() {
    const fromStorage = await getFromStorage()
    if (typeof fromStorage !== 'undefined') {
      yield fromStorage
    }

    try {
      for await (const event of asyncIterableFromEvent<CustomEvent<T>>(eventTarget, 'data', { signal: abortSignal })) {
        yield event.detail
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
      const stored = await storage.getItemRaw<T>(STORAGE_KEY.STATE)
      if (typeof stored === 'undefined' || stored === null) return
      const parsed = identity.parse(stored)
      return parsed
    } catch (cause) {
      logger.error(new Error(`[${name}] Failed to retrieve stored state`, { cause }))
    }
  }

  function startService({ source, storage: nextStorage, signal }: CreateServicePayload<T>): Disposable & { name: string } {
    if (!abortController.signal.aborted) abortController.abort()
    abortController = new AbortController()
    abortSignal = signal ? mergeSignals(abortController.signal, signal) : abortController.signal
    abortSignal.addEventListener('abort', dispose, { once: true })

    if (nextStorage) {
      storage = setStorage(nextStorage)
    }

    sources = Array.isArray(source) ? source : [source]
    observeAndHandleIncomingData()

    logger.info(`[${name}] service started`)
    started.resolve()

    return Object.freeze({
      name,
      [Symbol.dispose]: dispose,
    })

    async function observeAndHandleIncomingData() {
      for await (const data of abortable(mergeAsyncIterables(...sources), abortSignal)) {
        await storeValue(data)
        eventTarget.dispatchEvent(new CustomEvent('data', { detail: data }))
        logger.info(`[${name}] received data`, data)
      }

      logger.warn(`[${name}] observation ended`)
    }
  }

  function dispose() {
    if (!abortController.signal.aborted) abortController.abort()

    started = defer<void>()
    sources = []
    abortSignal.removeEventListener('abort', dispose)
    storage = undefined

    logger.warn(`[${name}] service stopped`)
  }

  async function setValue(value: Partial<T>, source?: Observable<T> | Promise<T> | AsyncIterable<T> | T) {
    const sourceData = await toPromise(source, mergeSignals(abortController.signal, AbortSignal.timeout(ACTION_TIMEOUT)))
    const next = Object.assign(sourceData ?? {}, value)
    await storeValue(identity.parse(next))
  }

  async function storeValue(value: T) {
    if (storage) {
      await storage
        .setItemRaw(STORAGE_KEY.STATE, value as never)
        .catch((cause) => logger.error(new Error(`[${name}] Failed to save state`, { cause })))
    }
  }
}
