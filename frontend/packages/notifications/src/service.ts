import { defineService } from '@evac/shared'
import * as def from './definitions'

export const service = defineService({
  name: def.SCOPE,
  identity: def.$Notifications,
})
  .withSources(
    async function* onList(source) {
      for await (const message of source) {
        const parsed = def.$NotificationsMessage.safeParse(message)
        if (!parsed.success) continue
        yield parsed.data
      }
    },
    async function* onDetail(source) {
      for await (const message of source) {
        const parsed = def.$NotificationDetailMessage.safeParse(message)
        if (!parsed.success) continue

        const state = await this.get()
        const next = new Map(state ?? [])
        next.set(parsed.data.uuid, parsed.data)
        yield next
      }
    },
    async function* onRemoved(source) {
      for await (const message of source) {
        const parsed = def.$NotificationRemovedMessage.safeParse(message)
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
    create(source, input: def.$NotificationFormData) {
      const alarm = {
        ...def.$NotificationFormData.parse(input),
        uuid: self.crypto.randomUUID(),
      } satisfies def.$Notification

      source.send(def.$NotificationSetMessage.encode(alarm))
    },
    remove(source, input: def.$Notification['uuid']) {
      source.send(def.$NotificationRemoveMessage.encode(input))
    },
    update(source, input: def.$Notification) {
      const notification = def.$Notification.parse(input)
      source.send(def.$NotificationSetMessage.encode(notification))
    },
    seed(): def.$NotificationFormData {
      return {
        name: '',
        subject: '',
        short: '',
        long: '',
      } satisfies def.$NotificationFormData
    },
    async send(source, input: def.$NotificationToSend) {
      source.send(def.$NotificationSendMessage.encode(input))
    },
  })
