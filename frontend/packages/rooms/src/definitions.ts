import * as z from 'zod'

export type $Room = z.infer<typeof $Room>
export type $RoomFormData = z.infer<typeof $RoomFormData>
export type $Rooms = z.infer<typeof $Rooms>

export const ICON = 'meeting_room'
export const SCOPE = 'rooms'

export const Point = z.tuple([z.number(), z.number()]).describe('A point in 2D space [x, y]')

export const $RoomFormData = z.object({
  name: z.string(),
  location: z.uuid().describe('The UUID of the location this room belongs to'),
  points: z.array(Point).describe('A list of points defining the room boundary in 2D space'),
})

export const $Room = z.object({
  ...$RoomFormData.shape,
  uuid: z.uuidv4(),
})

export const $Rooms = z.map(z.uuidv4(), $Room)

export const $RoomsMessage = z.codec(z.object({ RoomList: z.array($Room) }), $Rooms, {
  decode: (data) => new Map(data.RoomList.map((item) => [item.uuid, item])),
  encode: (map) => ({ RoomList: Array.from(map.values()) }),
})

export const $RoomRemoveMessage = z.codec(z.object({ RoomRemove: z.uuidv4() }), z.uuidv4(), {
  decode: (data) => data.RoomRemove,
  encode: (uuid) => ({ RoomRemove: uuid }),
})

export const $RoomRemovedMessage = z.codec(z.object({ RoomRemoved: z.uuidv4() }), z.uuidv4(), {
  decode: (data) => data.RoomRemoved,
  encode: (uuid) => ({ RoomRemoved: uuid }),
})

export const $RoomSetMessage = z.codec(z.object({ RoomSet: $Room }), $Room, {
  decode: (data) => data.RoomSet,
  encode: (location) => ({ RoomSet: location }),
})

export const $RoomDetailMessage = z.codec(z.object({ RoomDetail: $Room }), $Room, {
  decode: (data) => data.RoomDetail,
  encode: (location) => ({ RoomDetail: location }),
})
