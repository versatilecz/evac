import { defineService } from '@evac/shared'
import { SCOPE, Rooms, RoomsMessage, type $Rooms } from './definitions'

export const service = defineService<$Rooms>({
  name: SCOPE,
  identity: Rooms,
})

export async function* parseMessages(source: AsyncIterable<unknown>): AsyncGenerator<$Rooms, void, unknown> {
  for await (const message of source) {
    const parsed = RoomsMessage.safeParse(message)
    if (!parsed.success) continue
    yield parsed.data
  }
}
