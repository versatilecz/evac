import { createStorage } from 'unstorage'
import indexedDbDriver from 'unstorage/drivers/indexedb'
import memoryDriver from 'unstorage/drivers/memory'
import localStorageDriver from 'unstorage/drivers/localstorage'

export const storage = {
  indexedDb: createStorage({ driver: indexedDbDriver({ dbName: 'evac', storeName: 'mvp' }) }),
  local: createStorage({ driver: localStorageDriver({ storage: localStorage }) }),
  memory: createStorage({ driver: memoryDriver() }),
  session: createStorage({ driver: localStorageDriver({ base: 'evac', storage: sessionStorage }) }),
} as const
