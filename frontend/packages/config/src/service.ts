import { defineService } from '@evac/shared'
import * as def from './definitions'

export const service = defineService({
  name: def.SCOPE,
  identity: def.$AppConfig,
}).withSources(async function* onConfig(source) {
  for await (const message of source) {
    const parsed = def.$ConfigMessage.safeParse(message)
    if (!parsed.success) continue
    yield parsed.data.Config
  }
})
