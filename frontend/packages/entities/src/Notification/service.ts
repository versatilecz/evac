import { defineService } from '@evac/shared'
import * as def from './definitions'

export const service = defineService({
  name: def.SCOPE,
  identity: def.Store,
})
  .withSources(
    async function* onList(source) {
      for await (const message of source) {
        const parsed = def.ListMessage.safeParse(message)
        if (!parsed.success) continue
        yield parsed.data
      }
    },
    async function* onDetail(source) {
      for await (const message of source) {
        const parsed = def.DetailMessage.safeParse(message)
        if (!parsed.success) continue

        const state = await this.get()
        const next = new Map(state ?? [])
        next.set(parsed.data.uuid, parsed.data)
        yield next
      }
    },
    async function* onRemoved(source) {
      for await (const message of source) {
        const parsed = def.RemovedMessage.safeParse(message)
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
    create(source, input: def.FormData) {
      const alarm = {
        ...def.FormData.parse(input),
        uuid: self.crypto.randomUUID(),
      } satisfies def.Detail

      source.send(def.SetMessage.encode(alarm))
    },
    remove(source, input: def.Detail['uuid']) {
      source.send(def.RemoveMessage.encode(input))
    },
    update(source, input: def.Detail) {
      const notification = def.Detail.parse(input)
      source.send(def.SetMessage.encode(notification))
    },
    seed(): def.FormData {
      return {
        name: '',
        subject: '',
        short: '',
        long: '',
      } satisfies def.FormData
    },
    async send(source, input: def.ToSend) {
      source.send(def.SendMessage.encode(input))
    },
  })
