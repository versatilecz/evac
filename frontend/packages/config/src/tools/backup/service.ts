import { defineService } from '@evac/shared'
import * as def from './definitions'

export const service = defineService({
  name: def.SCOPE,
  identity: def.$Backups,
})
  .withSources(
    async function* onList(source) {
      for await (const message of source) {
        const parsed = def.$BackupListMessage.safeParse(message)
        if (!parsed.success) continue
        yield parsed.data
      }
    },
    async function* onDetail(source) {
      for await (const message of source) {
        const parsed = def.$BackupMessage.safeParse(message)
        if (!parsed.success) continue

        const state = await this.get()
        const next = new Set(state ?? [])
        next.add(parsed.data)
        yield next
      }
    },
    async function* onRemoved(source) {
      for await (const message of source) {
        const parsed = def.$BackupRemoveMessage.safeParse(message)
        if (!parsed.success) continue

        const state = await this.get()
        if (!state) continue // Nothing to remove from
        const next = new Set(state)
        next.delete(parsed.data)
        yield next
      }
    }
  )
  .withActions({
    set(source, input: string) {
      source.send(def.$BackupMessage.encode(input))
    },
    remove(source, input: string) {
      source.send(def.$BackupRemoveMessage.encode(input))
    },
    restore(source, input: string) {
      source.send(def.$Restore.encode(input))
    },
  })
