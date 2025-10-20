import { defineService } from '@evac/shared'
import {
  SCOPE,
  $Location,
  $Locations,
  $LocationsMessage,
  $LocationDetailMessage,
  $LocationRemoveMessage,
  $LocationRemovedMessage,
  $LocationFormData,
  $LocationSetMessage,
} from './definitions'

export const service = defineService({
  name: SCOPE,
  identity: $Locations,
})
  .withSources(
    async function* onList(source) {
      for await (const message of source) {
        const parsed = $LocationsMessage.safeParse(message)
        if (!parsed.success) continue
        yield parsed.data
      }
    },
    async function* onDetail(source) {
      for await (const message of source) {
        const parsed = $LocationDetailMessage.safeParse(message)
        if (!parsed.success) continue

        const state = await this.get()
        const next = new Map(state ?? [])
        next.set(parsed.data.uuid, parsed.data)
        yield next
      }
    },
    async function* onRemoved(source) {
      for await (const message of source) {
        const parsed = $LocationRemovedMessage.safeParse(message)
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
    create(source, input: $LocationFormData) {
      const location = {
        ...$LocationFormData.parse(input),
        uuid: self.crypto.randomUUID(),
      } satisfies $Location

      source.send($LocationSetMessage.encode(location))
    },
    remove(source, input: string) {
      source.send($LocationRemoveMessage.encode(input))
    },
    update(source, input: $Location) {
      const location = $Location.parse(input)
      source.send($LocationSetMessage.encode(location))
    },
    seed(): $LocationFormData {
      return {
        name: '',
      } satisfies $LocationFormData
    },
  })
