import { $SortDirection, type $SortRule } from '@evac/shared'
import * as z from 'zod'

export type $Event = z.infer<typeof $Event>
export type $Events = z.infer<typeof $Events>

export const ICON = 'report'
export const SCOPE = 'events'
export const DEFAULT_SORT: $SortRule = { key: 'name', direction: $SortDirection.enum.Ascending }

export const $EventKind = z.enum(['advertisement', 'buttonPressed', 'buttonDoublePressed', 'buttonTriplePressed', 'buttonLongPressed', 'buttonHold', 'operator'])

export const $Event = z.object({
  uuid: z.uuid().describe('Event UUID'),
  kind: $EventKind.describe('Event kind'),
  timestamp: z.date().describe('Event timestamp'),
  scanner: z.uuid().describe('Relative scanner UUID'),
  device: z.uuid().optional().nullable().describe('Relative device UUID'),
})

const $TimestampCodec = z.codec(z.string(), z.date(), {
  decode: (input) => new Date(Date.parse(input)),
  encode: (data) => data.toISOString(),
})

export const $EventCodec = $Event.omit({ timestamp: true }).extend({
  timestamp: $TimestampCodec,
})

export const $Events = z.map(z.uuid(), $Event)

export const $EventsMessage = z.codec(z.object({ Events: z.array($EventCodec) }), $Events, {
  decode: (input) => new Map(input.Events.map((event) => [event.uuid, event])),
  encode: (data) => ({ Events: Array.from(data.values()) }),
})
