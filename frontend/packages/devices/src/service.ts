import { defineService } from '@evac/shared'
import * as def from './definitions'

export const service = defineService({
  name: def.SCOPE,
  identity: def.$Devices,
})
  .withSources(
    async function* onList(source) {
      for await (const message of source) {
        const parsed = def.$DevicesMessage.safeParse(message)
        if (!parsed.success) continue
        yield parsed.data
      }
    },
    async function* onDetail(source) {
      for await (const message of source) {
        const parsed = def.$DeviceDetailMessage.safeParse(message)
        if (!parsed.success) continue

        const state = await this.get()
        const next = new Map(state ?? [])
        next.set(parsed.data.uuid, parsed.data)
        yield next
      }
    },
    async function* onRemoved(source) {
      for await (const message of source) {
        const parsed = def.$DeviceRemovedMessage.safeParse(message)
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
    remove(source, input: string) {
      source.send(def.$DeviceRemoveMessage.encode(input))
    },
    update(source, input: def.$Device) {
      const device = def.$Device.parse(input)
      source.send(def.$DeviceSetMessage.encode(device))
    },
  })
