import { $SortDirection, type $SortRule } from '@evac/shared'
import * as z from 'zod'

export type $Email = z.infer<typeof $Email>
export type $Emails = z.infer<typeof $Emails>
export type $EmailFormData = z.infer<typeof $EmailFormData>

export const ICON = 'mail'
export const SCOPE = 'emails'
export const DEFAULT_SORT: $SortRule = { key: 'name', direction: $SortDirection.enum.Ascending }

export const $Email = z.object({
  name: z.string(),
  uuid: z.uuidv4(),
  subject: z.string(),
  text: z.string(),
  html: z.string(),
})

export const $Emails = z.map(z.uuidv4(), $Email)
export const $EmailFormData = $Email.omit({ uuid: true })
const $EmailCodec = $Email

export const $EmailsMessage = z.codec(z.object({ EmailList: z.array($EmailCodec) }), $Emails, {
  decode: (input) => new Map(input.EmailList.map((item) => [item.uuid, item])),
  encode: (data) => ({ EmailList: Array.from(data.values()) }),
})

export const $EmailRemoveMessage = z.codec(z.object({ EmailRemove: z.uuidv4() }), z.uuidv4(), {
  decode: (input) => input.EmailRemove,
  encode: (uuid) => ({ EmailRemove: uuid }),
})

export const $EmailRemovedMessage = z.codec(z.object({ EmailRemoved: z.uuidv4() }), z.uuidv4(), {
  decode: (input) => input.EmailRemoved,
  encode: (uuid) => ({ EmailRemoved: uuid }),
})

export const $EmailSetMessage = z.codec(z.object({ EmailSet: $EmailCodec }), $Email, {
  decode: (input) => input.EmailSet,
  encode: (item) => ({ EmailSet: item }),
})

export const $EmailDetailMessage = z.codec(z.object({ EmailDetail: $EmailCodec }), $Email, {
  decode: (input) => input.EmailDetail,
  encode: (item) => ({ EmailDetail: item }),
})
