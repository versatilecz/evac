import { defineService } from '@evac/shared'
import { SCOPE, $Scanners, $ScannersMessage } from './definitions'

export const service = defineService({
  name: SCOPE,
  identity: $Scanners,
}).withSources(async function* onList(source) {
  for await (const message of source) {
    const parsed = $ScannersMessage.safeParse(message)
    if (!parsed.success) continue
    yield parsed.data
  }
})
