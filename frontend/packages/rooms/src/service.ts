import { Location } from '@evac/entities'
import { defineService, generateUUID, logger } from '@evac/shared'
import { SCOPE, $Rooms, $RoomsMessage, $RoomDetailMessage, $RoomRemovedMessage, $RoomFormData, $Room, $RoomSetMessage, $RoomRemoveMessage } from './definitions'

export const service = defineService({
  name: SCOPE,
  identity: $Rooms,
})
  .withSources(
    async function* onList(source) {
      for await (const message of source) {
        const parsed = $RoomsMessage.safeParse(message)
        if (!parsed.success) continue
        yield parsed.data
      }
    },
    async function* onDetail(source) {
      for await (const message of source) {
        const parsed = $RoomDetailMessage.safeParse(message)
        if (!parsed.success) continue

        const state = await this.get()
        const next = new Map(state ?? [])
        next.set(parsed.data.uuid, parsed.data)
        yield next
      }
    },
    async function* onRemoved(source) {
      for await (const message of source) {
        const parsed = $RoomRemovedMessage.safeParse(message)
        if (!parsed.success) continue

        const state = await this.get()
        if (!state) continue // Nothing to remove from
        const next = new Map(state)
        next.delete(parsed.data)
        yield next
      }
    },
    async function* onLocationRemoved(source) {
      for await (const message of source) {
        const parsed = Location.RemovedMessage.safeParse(message)
        if (!parsed.success) continue

        const state = await this.get()
        if (!state) continue // Nothing to remove from

        const location = parsed.data
        const next = new Map(Iterator.from(state).filter(([, room]) => room.location !== location))
        yield next

        const current = new Set(state.keys())
        const afterRemoval = new Set(next.keys())
        const affected = current.difference(afterRemoval)
        if (affected.size === 0) continue
        logger.info(`[rooms] ${affected.size} rooms were affected by location removal (${[...affected].join(', ')})`)
      }
    }
  )
  .withActions({
    create(source, input: $RoomFormData) {
      const location = {
        ...$RoomFormData.parse(input),
        uuid: generateUUID(),
      } satisfies $Room

      source.send($RoomSetMessage.encode(location))
    },
    remove(source, input: string) {
      source.send($RoomRemoveMessage.encode(input))
    },
    update(source, input: $Room) {
      const location = $Room.parse(input)
      source.send($RoomSetMessage.encode(location))
    },
    seed(): $RoomFormData {
      return {
        name: '',
        location: '',
        points: [],
      }
    },
  })
