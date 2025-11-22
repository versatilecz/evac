import { SortDirection, type SortRule } from '@evac/shared'
import * as z from 'zod'

export type Store = z.infer<typeof Store>
export type Detail = z.infer<typeof Detail>
export type FormData = z.infer<typeof FormData>

export const ICON = 'group'
export const SCOPE = 'contactGroups'
export const DEFAULT_SORT: SortRule = { key: 'name', direction: SortDirection.enum.Ascending }

export const Detail = z.object({
  uuid: z.uuid(),
  name: z.string(),
  contacts: z.set(z.uuid()),
})

export const ContactsCodec = z.codec(z.array(z.uuid()), z.set(z.uuid()), {
  decode: (data) => new Set(data),
  encode: (data) => Array.from(data),
})

export const DetailCodec = Detail.extend({
  contacts: ContactsCodec,
})

export const Store = z.map(z.uuid(), Detail)
export const FormData = Detail.omit({ uuid: true }).loose()

export const ListMessage = z.codec(z.object({ ContactGroupList: z.array(DetailCodec) }), Store, {
  decode: (data) => new Map(data.ContactGroupList.map((item) => [item.uuid, item])),
  encode: (map) => ({ ContactGroupList: Array.from(map.values()) }),
})
export const SetMessage = z.codec(z.object({ ContactGroupSet: DetailCodec }), Detail, {
  decode: (data) => data.ContactGroupSet,
  encode: (group) => ({ ContactGroupSet: group }),
})
export const DetailMessage = z.codec(z.object({ ContactGroupDetail: DetailCodec }), Detail, {
  decode: (data) => data.ContactGroupDetail,
  encode: (group) => ({ ContactGroupDetail: group }),
})
export const RemoveMessage = z.codec(z.object({ ContactGroupRemove: z.uuid() }), z.uuid(), {
  decode: (data) => data.ContactGroupRemove,
  encode: (uuid) => ({ ContactGroupRemove: uuid }),
})
export const RemovedMessage = z.codec(z.object({ ContactGroupRemoved: z.uuid() }), z.uuid(), {
  decode: (data) => data.ContactGroupRemoved,
  encode: (uuid) => ({ ContactGroupRemoved: uuid }),
})
