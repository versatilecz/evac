import { $SortDirection, type $SortRule } from '@evac/shared'
import * as z from 'zod'

export type $Notification = z.infer<typeof $Notification>
export type $Notifications = z.infer<typeof $Notifications>
export type $NotificationFormData = z.infer<typeof $NotificationFormData>
export type $NotificationToSend = z.infer<typeof $NotificationToSend>

export const ICON = 'mail'
export const SCOPE = 'notifications'
export const DEFAULT_SORT: $SortRule = { key: 'name', direction: $SortDirection.enum.Ascending }

export const $Notification = z.object({
  name: z.string(),
  uuid: z.uuidv4(),
  subject: z.string(),
  short: z.string(),
  long: z.string(),
})

export const $Notifications = z.map(z.uuidv4(), $Notification)
export const $NotificationFormData = $Notification.omit({ uuid: true })
const $NotificationCodec = $Notification

export const $NotificationToSend = $Notification.pick({ subject: true, text: true, html: true })

export const $NotificationsMessage = z.codec(z.object({ NotificationList: z.array($NotificationCodec) }), $Notifications, {
  decode: (input) => new Map(input.NotificationList.map((item) => [item.uuid, item])),
  encode: (data) => ({ NotificationList: Array.from(data.values()) }),
})

export const $NotificationRemoveMessage = z.codec(z.object({ NotificationRemove: z.uuidv4() }), z.uuidv4(), {
  decode: (input) => input.NotificationRemove,
  encode: (uuid) => ({ NotificationRemove: uuid }),
})

export const $NotificationRemovedMessage = z.codec(z.object({ NotificationRemoved: z.uuidv4() }), z.uuidv4(), {
  decode: (input) => input.NotificationRemoved,
  encode: (uuid) => ({ NotificationRemoved: uuid }),
})

export const $NotificationSetMessage = z.codec(z.object({ NotificationSet: $NotificationCodec }), $Notification, {
  decode: (input) => input.NotificationSet,
  encode: (item) => ({ NotificationSet: item }),
})

export const $NotificationDetailMessage = z.codec(z.object({ NotificationDetail: $NotificationCodec }), $Notification, {
  decode: (input) => input.NotificationDetail,
  encode: (item) => ({ NotificationDetail: item }),
})

export const $NotificationSendMessage = z.codec(z.object({ Notification: $NotificationToSend }), $NotificationToSend, {
  decode: (input) => input.Notification,
  encode: (item) => ({ Notification: item }),
})
