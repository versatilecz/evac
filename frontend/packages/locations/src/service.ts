import { defineService } from '@evac/shared'
import { SCOPE, Locations, LocationsMessage, type $Locations } from './definitions'

export const service = defineService<$Locations>({
  name: SCOPE,
  identity: Locations,
})

export async function* parseMessages(source: AsyncIterable<unknown>): AsyncGenerator<$Locations, void, unknown> {
  for await (const message of source) {
    const parsed = LocationsMessage.safeParse(message)
    if (!parsed.success) continue
    yield parsed.data
  }
}
