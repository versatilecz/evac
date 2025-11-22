import { SortDirection, type SortRule } from '@evac/shared'
import * as z from 'zod'

export type $Event = z.infer<typeof $Event>
export type $Events = z.infer<typeof $Events>
export type $EventKind = z.infer<typeof $EventKind>
export type $EventFormData = z.infer<typeof $EventFormData>

export const ICON = 'report'
export const SCOPE = 'events'
export const DEFAULT_SORT: SortRule = { key: 'timestamp', direction: SortDirection.enum.Descending }

export const ICON_BY_KIND: Record<$EventKind, string> = {
  advertisement: 'bluetooth',
  buttonPressed: 'touch_app',
  buttonDoublePressed: 'touch_double',
  buttonTriplePressed: 'touch_triple',
  buttonLongPressed: 'touch_long',
  buttonHold: 'reminder',
  operator: 'person',
}

export const $EventKind = z.enum(['advertisement', 'buttonPressed', 'buttonDoublePressed', 'buttonTriplePressed', 'buttonLongPressed', 'buttonHold', 'operator'])

export const $Event = z.object({
  uuid: z.uuid().describe('Event UUID'),
  kind: $EventKind.describe('Event kind'),
  timestamp: z.date().describe('Event timestamp'),
  scanner: z.uuid().describe('Relative scanner UUID'),
  device: z.uuid().optional().nullable().describe('Relative device UUID'),
})

export const $EventFormData = $Event.omit({ uuid: true, timestamp: true })

const $TimestampCodec = z.codec(z.string(), z.date(), {
  decode: (input) => new Date(Date.parse(input)),
  encode: (data) => data.toISOString(),
})

export const $EventCodec = $Event.omit({ timestamp: true }).extend({
  timestamp: $TimestampCodec,
})

export const $Events = z.map(z.uuid(), $Event)

export const $EventsMessage = z.codec(z.object({ EventList: z.array($EventCodec) }), $Events, {
  decode: (input) => new Map(input.EventList.map((event) => [event.uuid, event])),
  encode: (data) => ({ EventList: Array.from(data.values()) }),
})
export const $EventMessage = z.codec(z.object({ Event: $EventCodec }), $Event, {
  decode: (input) => input.Event,
  encode: (data) => ({ Event: data }),
})
export const $EventRemoveMessage = z.codec(z.object({ EventRemove: z.uuid() }), z.uuid(), {
  decode: (input) => input.EventRemove,
  encode: (uuid) => ({ EventRemove: uuid }),
})
export const $EventRemovedMessage = z.codec(z.object({ EventRemoved: z.uuid() }), z.uuid(), {
  decode: (input) => input.EventRemoved,
  encode: (uuid) => ({ EventRemoved: uuid }),
})
