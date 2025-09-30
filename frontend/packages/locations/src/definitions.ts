import * as z from 'zod'

export type $Location = z.infer<typeof Location>
export type $Locations = z.infer<typeof Locations>

export const SCOPE = 'locations'

export const Location = z.object({
  name: z.string(),
  uuid: z.uuidv4(),
})

export const Locations = z.map(z.uuidv4(), Location)

export const LocationsMessage = z.codec(z.object({ LocationList: z.array(Location) }), Locations, {
  decode: (data) => new Map(data.LocationList.map((item) => [item.uuid, item])),
  encode: (map) => ({ LocationList: Array.from(map.values()) }),
})
