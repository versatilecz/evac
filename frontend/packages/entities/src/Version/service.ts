import { defineService } from '@evac/shared'
import * as def from './definitions'

export const service = defineService({
  name: def.SCOPE,
  identity: def.Backend,
}).withSources(async function* onData(source) {
  for await (const message of source) {
    const parsed = def.VersionMessage.safeParse(message)
    if (!parsed.success) continue

    yield parsed.data
  }
})
