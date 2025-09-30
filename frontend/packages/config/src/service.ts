import { defineService } from '@evac/shared'
import { SCOPE, AppConfig, ConfigMessage, type $AppConfig } from './definitions'

export const service = defineService<$AppConfig>({
  name: SCOPE,
  identity: AppConfig,
})

export async function* parseMessages(source: AsyncIterable<unknown>): AsyncGenerator<$AppConfig, void, unknown> {
  for await (const message of source) {
    const parsed = ConfigMessage.safeParse(message)
    if (!parsed.success) continue
    yield parsed.data.Config
  }
}
