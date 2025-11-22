import { SortDirection, type SortRule } from '@evac/shared'
import * as z from 'zod'

export type $Activity = z.infer<typeof $Activity>
export type $ActivityByDevice = z.infer<typeof $ActivityByDevice>

export const ICON = 'notifications_active'
export const SCOPE = 'activity'
export const DEFAULT_SORT: SortRule = { key: 'timestamp', direction: SortDirection.enum.Ascending }

export const $Activity = z.object({
  device: z.uuid(),
  scanner: z.uuid(),
  rssi: z.number(),
  timestamp: z.date(),
})

const TimestampCodec = z.codec(z.union([z.string(), z.number()]), z.date(), {
  decode: (input) => new Date(typeof input === 'string' ? Date.parse(input) : input),
  encode: (data) => data.toISOString(),
})

export const $ActivityByDevice = z.map(z.uuid(), $Activity)
const $ActivityCodec = z.codec($Activity.extend({ timestamp: TimestampCodec }), $Activity, {
  decode: (input) => structuredClone(input),
  encode: (data) => structuredClone(data),
})

export const $ActivityListMessage = z.codec(z.object({ ActivityList: z.array($ActivityCodec) }), $ActivityByDevice, {
  decode: (input) => new Map(input.ActivityList.map((activity) => [activity.device, activity])),
  encode: (data) => ({ ActivityList: Array.from(data.values()) }),
})

export const $ActivityMessage = z.codec(z.object({ Activity: $ActivityCodec }), $Activity, {
  decode: (input) => structuredClone(input.Activity),
  encode: (data) => ({ Activity: structuredClone(data) }),
})
