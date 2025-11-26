import { createStorage } from 'unstorage'
import indexedDbDriver from 'unstorage/drivers/indexedb'
import memoryDriver from 'unstorage/drivers/memory'

export const storage = {
  indexedDb: createStorage({ driver: indexedDbDriver({ dbName: 'evac', storeName: 'mvp' }) }),
  memory: createStorage({ driver: memoryDriver() }),
} as const
