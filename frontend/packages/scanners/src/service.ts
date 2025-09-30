import { defineService } from '@evac/shared'
import { SCOPE, Scanners, ScannersMessage, type $Scanners } from './definitions'

export const service = defineService({
  name: SCOPE,
  identity: Scanners,
})

export async function* parseMessages(source: AsyncIterable<unknown>): AsyncGenerator<$Scanners, void, unknown> {
  for await (const message of source) {
    const parsed = ScannersMessage.safeParse(message)
    if (!parsed.success) continue
    yield parsed.data
  }
}
