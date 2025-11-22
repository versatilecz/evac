import { SortDirection, type SortRule } from '@evac/shared'
import * as z from 'zod'

export type Detail = z.infer<typeof Detail>
export type Store = z.infer<typeof Store>
export type FormData = z.infer<typeof FormData>
export type ToSend = z.infer<typeof ToSend>

export const ICON = 'mail'
export const SCOPE = 'notifications'
export const DEFAULT_SORT: SortRule = { key: 'name', direction: SortDirection.enum.Ascending }

export const Detail = z.object({
  name: z.string(),
  uuid: z.uuid(),
  subject: z.string(),
  short: z.string(),
  long: z.string(),
})
export const Store = z.map(z.uuid(), Detail)
export const FormData = Detail.omit({ uuid: true }).loose()
export const DetailCodec = Detail
export const ToSend = Detail.pick({ subject: true, short: true, long: true })

export const ListMessage = z.codec(z.object({ NotificationList: z.array(DetailCodec) }), Store, {
  decode: (input) => new Map(input.NotificationList.map((item) => [item.uuid, item])),
  encode: (data) => ({ NotificationList: Array.from(data.values()) }),
})
export const SetMessage = z.codec(z.object({ NotificationSet: DetailCodec }), Detail, {
  decode: (input) => input.NotificationSet,
  encode: (item) => ({ NotificationSet: item }),
})
export const DetailMessage = z.codec(z.object({ NotificationDetail: DetailCodec }), Detail, {
  decode: (input) => input.NotificationDetail,
  encode: (item) => ({ NotificationDetail: item }),
})
export const RemoveMessage = z.codec(z.object({ NotificationRemove: z.uuid() }), z.uuid(), {
  decode: (input) => input.NotificationRemove,
  encode: (uuid) => ({ NotificationRemove: uuid }),
})
export const RemovedMessage = z.codec(z.object({ NotificationRemoved: z.uuid() }), z.uuid(), {
  decode: (input) => input.NotificationRemoved,
  encode: (uuid) => ({ NotificationRemoved: uuid }),
})
export const SendMessage = z.codec(z.object({ Notification: ToSend }), ToSend, {
  decode: (input) => input.Notification,
  encode: (item) => ({ Notification: item }),
})
