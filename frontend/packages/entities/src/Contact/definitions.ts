import { SortDirection, type SortRule } from '@evac/shared'
import * as z from 'zod'

export type Store = z.infer<typeof Store>
export type Detail = z.infer<typeof Detail>
export type EmailDetail = z.infer<typeof EmailDetail>
export type SmsDetail = z.infer<typeof SmsDetail>
export type FormData = z.infer<typeof FormData>
export type KindIdentifier = z.infer<typeof KindIdentifier>
export type Kind = z.infer<typeof Kind>
export type SmsKind = z.infer<typeof SmsKind>
export type EmailKind = z.infer<typeof EmailKind>

export const ICON = 'contacts'
export const SCOPE = 'contacts'
export const DEFAULT_KIND: KindIdentifier = 'email'
export const DEFAULT_SORT: SortRule = { key: 'name', direction: SortDirection.enum.Ascending }

export const SmsKind = z.object({
  sms: z.object({
    number: z.string(),
  }),
})
export const EmailKind = z.object({
  email: z.object({
    email: z.string(),
  }),
})
export const Kind = z.union([SmsKind, EmailKind])
export const KindIdentifier = z.enum(['sms', 'email'])

export const Detail = z.object({
  uuid: z.uuid(),
  name: z.string(),
  kind: Kind,
})
export const EmailDetail = Detail.extend({
  kind: EmailKind,
})
export const SmsDetail = Detail.extend({
  kind: SmsKind,
})
export const Store = z.map(z.uuid(), Detail)
export const FormData = Detail.omit({ uuid: true }).loose()

export const ListMessage = z.codec(z.object({ ContactList: z.array(Detail) }), Store, {
  decode: (data) => new Map(data.ContactList.map((item) => [item.uuid, item])),
  encode: (map) => ({ ContactList: Array.from(map.values()) }),
})
export const SetMessage = z.codec(z.object({ ContactSet: Detail }), Detail, {
  decode: (data) => data.ContactSet,
  encode: (contact) => ({ ContactSet: contact }),
})
export const DetailMessage = z.codec(z.object({ ContactDetail: Detail }), Detail, {
  decode: (data) => data.ContactDetail,
  encode: (contact) => ({ ContactDetail: contact }),
})
export const RemoveMessage = z.codec(z.object({ ContactRemove: z.uuid() }), z.uuid(), {
  decode: (data) => data.ContactRemove,
  encode: (uuid) => ({ ContactRemove: uuid }),
})
export const RemovedMessage = z.codec(z.object({ ContactRemoved: z.uuid() }), z.uuid(), {
  decode: (data) => data.ContactRemoved,
  encode: (uuid) => ({ ContactRemoved: uuid }),
})
