import { defineService } from '@evac/shared'
import { SCOPE, Devices, DevicesMessage, type $Devices } from './definitions'

export const service = defineService({
  name: SCOPE,
  identity: Devices,
})

export async function* parseMessages(source: AsyncIterable<unknown>): AsyncGenerator<$Devices, void, unknown> {
  for await (const message of source) {
    const parsed = DevicesMessage.safeParse(message)
    if (!parsed.success) continue
    yield parsed.data
  }
}
