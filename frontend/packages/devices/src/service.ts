import { defineService } from '@evac/shared'
import { SCOPE, $Devices, $DevicesMessage } from './definitions'

export const service = defineService({
  name: SCOPE,
  identity: $Devices,
}).withSources(async function* onList(source) {
  for await (const message of source) {
    const parsed = $DevicesMessage.safeParse(message)
    if (!parsed.success) continue
    yield parsed.data
  }
})
