import { SortDirection, type SortRule } from '@evac/shared'
import * as z from 'zod'

export type Store = z.infer<typeof Store>
export type Detail = z.infer<typeof Detail>
export type FormData = z.infer<typeof FormData>
export type Reference = z.infer<typeof Reference>
export type ReferenceFilter = z.infer<typeof ReferenceFilter>

export const ICON = 'location_on'
export const SCOPE = 'locations'
export const DEFAULT_SORT: SortRule = { key: 'name', direction: SortDirection.enum.Ascending }

export const Detail = z.object({
  uuid: z.uuid(),
  name: z.string().min(1, { message: 'validation.required' }),
})
export const Store = z.map(z.uuid(), Detail)
export const FormData = Detail.omit({ uuid: true }).loose()

export const ListMessage = z.codec(z.object({ LocationList: z.array(Detail) }), Store, {
  decode: (data) => new Map(data.LocationList.map((item) => [item.uuid, item])),
  encode: (map) => ({ LocationList: Array.from(map.values()) }),
})
export const SetMessage = z.codec(z.object({ LocationSet: Detail }), Detail, {
  decode: (data) => data.LocationSet,
  encode: (location) => ({ LocationSet: location }),
})
export const DetailMessage = z.codec(z.object({ LocationDetail: Detail }), Detail, {
  decode: (data) => data.LocationDetail,
  encode: (location) => ({ LocationDetail: location }),
})
export const RemoveMessage = z.codec(z.object({ LocationRemove: z.uuid() }), z.uuid(), {
  decode: (data) => data.LocationRemove,
  encode: (uuid) => ({ LocationRemove: uuid }),
})
export const RemovedMessage = z.codec(z.object({ LocationRemoved: z.uuid() }), z.uuid(), {
  decode: (data) => data.LocationRemoved,
  encode: (uuid) => ({ LocationRemoved: uuid }),
})

export const ReferenceFilter = z.enum(['all', 'include', 'exclude'])

export const Reference = z.object({
  location: z.uuid(),
})
