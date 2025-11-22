import * as z from 'zod'

export type $Location = z.infer<typeof $Location>
export type $LocationFormData = z.infer<typeof $LocationFormData>
export type $Locations = z.infer<typeof $Locations>

export const ICON = 'location_on'
export const SCOPE = 'locations'

export const $LocationFormData = z.object({
  name: z.string().min(1, { message: 'validation.required' }),
})

export const $Location = z.object({
  ...$LocationFormData.shape,
  uuid: z.uuid(),
})

export const $Locations = z.map(z.uuid(), $Location)

export const $LocationsMessage = z.codec(z.object({ LocationList: z.array($Location) }), $Locations, {
  decode: (data) => new Map(data.LocationList.map((item) => [item.uuid, item])),
  encode: (map) => ({ LocationList: Array.from(map.values()) }),
})

export const $LocationRemoveMessage = z.codec(z.object({ LocationRemove: z.uuid() }), z.uuid(), {
  decode: (data) => data.LocationRemove,
  encode: (uuid) => ({ LocationRemove: uuid }),
})

export const $LocationRemovedMessage = z.codec(z.object({ LocationRemoved: z.uuid() }), z.uuid(), {
  decode: (data) => data.LocationRemoved,
  encode: (uuid) => ({ LocationRemoved: uuid }),
})

export const $LocationSetMessage = z.codec(z.object({ LocationSet: $Location }), $Location, {
  decode: (data) => data.LocationSet,
  encode: (location) => ({ LocationSet: location }),
})

export const $LocationDetailMessage = z.codec(z.object({ LocationDetail: $Location }), $Location, {
  decode: (data) => data.LocationDetail,
  encode: (location) => ({ LocationDetail: location }),
})
