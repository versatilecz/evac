import { defineService } from '@evac/shared'
import { SCOPE, $AppConfig, $ConfigMessage } from './definitions'

export const service = defineService({
  name: SCOPE,
  identity: $AppConfig,
}).withSources(async function* onConfig(source) {
  for await (const message of source) {
    const parsed = $ConfigMessage.safeParse(message)
    if (!parsed.success) continue
    yield parsed.data.Config
  }
})
