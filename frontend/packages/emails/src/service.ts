import { defineService } from '@evac/shared'
import * as def from './definitions'

export const service = defineService({
  name: def.SCOPE,
  identity: def.$Emails,
})
  .withSources(
    async function* onList(source) {
      for await (const message of source) {
        const parsed = def.$EmailsMessage.safeParse(message)
        if (!parsed.success) continue
        yield parsed.data
      }
    },
    async function* onDetail(source) {
      for await (const message of source) {
        const parsed = def.$EmailDetailMessage.safeParse(message)
        if (!parsed.success) continue

        const state = await this.get()
        const next = new Map(state ?? [])
        next.set(parsed.data.uuid, parsed.data)
        yield next
      }
    },
    async function* onRemoved(source) {
      for await (const message of source) {
        const parsed = def.$EmailRemovedMessage.safeParse(message)
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
    create(source, input: def.$EmailFormData) {
      const alarm = {
        ...def.$EmailFormData.parse(input),
        uuid: self.crypto.randomUUID(),
      } satisfies def.$Email

      source.send(def.$EmailSetMessage.encode(alarm))
    },
    remove(source, input: def.$Email['uuid']) {
      source.send(def.$EmailRemoveMessage.encode(input))
    },
    update(source, input: def.$Email) {
      const email = def.$Email.parse(input)
      source.send(def.$EmailSetMessage.encode(email))
    },
    seed(): def.$EmailFormData {
      return {
        name: '',
        subject: '',
        text: '',
        html: '',
      } satisfies def.$EmailFormData
    },
    async send(source, input: def.$EmailToSend) {
      source.send(def.$EmailSendMessage.encode(input))
    },
  })
