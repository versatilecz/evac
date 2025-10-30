import { $SortDirection, type $SortRule } from '@evac/shared'
import * as z from 'zod'

export type $Activity = z.infer<typeof $Activity>
export type $ActivityByDevice = z.infer<typeof $ActivityByDevice>

export const ICON = 'notifications_active'
export const SCOPE = 'activity'
export const DEFAULT_SORT: $SortRule = { key: 'name', direction: $SortDirection.enum.Ascending }

export const $Activity = z.object({
  device: z.uuidv4(),
  scanner: z.uuidv4(),
  rssi: z.number(),
  timestamp: z.union([z.string(), z.number()]),
})

export const $ActivityByDevice = z.map(z.uuidv4(), $Activity)
const $ActivityCodec = $Activity

export const $ActivityListMessage = z.codec(z.object({ ActivityList: z.array($ActivityCodec) }), $ActivityByDevice, {
  decode: (input) => new Map(input.ActivityList.map((activity) => [activity.device, activity])),
  encode: (data) => ({ ActivityList: Array.from(data.values()) }),
})

export const $ActivityMessage = z.codec(z.object({ Activity: $ActivityCodec }), $Activity, {
  decode: (input) => structuredClone(input.Activity),
  encode: (data) => ({ Activity: structuredClone(data) }),
})
