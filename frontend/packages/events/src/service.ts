import { defineService } from '@evac/shared'
import * as def from './definitions'

export const service = defineService({
  name: def.SCOPE,
  identity: def.$Events,
}).withSources(async function* onList(source) {
  for await (const message of source) {
    const parsed = def.$EventsMessage.safeParse(message)
    if (!parsed.success) continue
    yield parsed.data
  }
})
