import { defineService } from '@evac/shared'
import * as def from './definitions'

export const service = defineService({
  name: def.SCOPE,
  identity: def.$Locations,
})
  .withSources(
    async function* onList(source) {
      for await (const message of source) {
        const parsed = def.$LocationsMessage.safeParse(message)
        if (!parsed.success) continue
        yield parsed.data
      }
    },
    async function* onDetail(source) {
      for await (const message of source) {
        const parsed = def.$LocationDetailMessage.safeParse(message)
        if (!parsed.success) continue

        const state = await this.get()
        const next = new Map(state ?? [])
        next.set(parsed.data.uuid, parsed.data)
        yield next
      }
    },
    async function* onRemoved(source) {
      for await (const message of source) {
        const parsed = def.$LocationRemovedMessage.safeParse(message)
        if (!parsed.success) continue

        const state = await this.get()
        if (!state) continue // Nothing to remove from
        const next = new Map(state)
        next.delete(parsed.data)
        yield next
      }
    }
  )
  .withActions({
    create(source, input: def.$LocationFormData) {
      const location = {
        ...def.$LocationFormData.parse(input),
        uuid: self.crypto.randomUUID(),
      } satisfies def.$Location

      source.send(def.$LocationSetMessage.encode(location))
    },
    remove(source, input: string) {
      source.send(def.$LocationRemoveMessage.encode(input))
    },
    update(source, input: def.$Location) {
      const location = def.$Location.parse(input)
      source.send(def.$LocationSetMessage.encode(location))
    },
    seed(): def.$LocationFormData {
      return {
        name: '',
      } satisfies def.$LocationFormData
    },
  })
