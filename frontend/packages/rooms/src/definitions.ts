import * as z from 'zod'

export type $Room = z.infer<typeof Room>
export type $Rooms = z.infer<typeof Rooms>

export const SCOPE = 'rooms'

export const Point = z.tuple([z.number(), z.number()]).describe('A point in 2D space [x, y]')

export const Room = z.object({
  name: z.string(),
  uuid: z.uuidv4(),
  location: z.uuid().describe('The UUID of the location this room belongs to'),
  points: z.array(Point).describe('A list of points defining the room boundary in 2D space'),
})

export const Rooms = z.map(z.uuidv4(), Room)

export const RoomsMessage = z.codec(z.object({ RoomList: z.array(Room) }), Rooms, {
  decode: (data) => new Map(data.RoomList.map((item) => [item.uuid, item])),
  encode: (map) => ({ RoomList: Array.from(map.values()) }),
})
