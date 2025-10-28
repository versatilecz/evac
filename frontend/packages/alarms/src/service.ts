import { defineService } from '@evac/shared'
import * as def from './definitions'

export const service = defineService({
  name: def.SCOPE,
  identity: def.$Alarms,
})
  .withSources(
    async function* onList(source) {
      for await (const message of source) {
        const parsed = def.$AlarmsMessage.safeParse(message)
        if (!parsed.success) continue
        yield parsed.data
      }
    },
    async function* onDetail(source) {
      for await (const message of source) {
        const parsed = def.$AlarmDetailMessage.safeParse(message)
        if (!parsed.success) continue

        const state = await this.get()
        const next = new Map(state ?? [])
        next.set(parsed.data.uuid, parsed.data)
        yield next
      }
    },
    async function* onRemoved(source) {
      for await (const message of source) {
        const parsed = def.$AlarmRemovedMessage.safeParse(message)
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
    create(source, input: def.$AlarmFormData) {
      const alarm = {
        ...def.$AlarmFormData.parse(input),
        uuid: self.crypto.randomUUID(),
      } satisfies def.$Alarm

      source.send(def.$AlarmSetMessage.encode(alarm))
    },
    remove(source, input: string) {
      source.send(def.$AlarmRemoveMessage.encode(input))
    },
    update(source, input: def.$Alarm) {
      const alarm = def.$Alarm.parse(input)
      source.send(def.$AlarmSetMessage.encode(alarm))
    },
    seed(): def.$AlarmFormData {
      return {
        name: '',
        subject: '',
        text: '',
        html: '',
        buzzer: false,
        led: false,
      } satisfies def.$AlarmFormData
    },
  })
