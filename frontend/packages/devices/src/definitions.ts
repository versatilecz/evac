import { $Activity } from '@evac/activity'
import { $MacAddress, macCodec, isoDatetimeToDate, SortDirection, type SortRule } from '@evac/shared'
import * as z from 'zod'

export type $Device = z.infer<typeof $Device>
export type $DeviceWithActivity = z.infer<typeof $DeviceWithActivity>
export type $Devices = z.infer<typeof $Devices>

export type $SourceType = z.infer<typeof $SourceType>

export const ICON = 'devices_wearables'
export const SCOPE = 'devices'
export const DEFAULT_SORT: SortRule = { key: 'name', direction: SortDirection.enum.Ascending }

export const $Device = z.object({
  uuid: z.uuid(),
  name: z.string().nullish(),
  mac: $MacAddress,
  lastActivity: z.date(),
  enabled: z.boolean(),
  battery: z.number().min(0).max(100).nullish(),
})
export const $DeviceWithActivity = $Device.extend({
  rssi: $Activity.shape.rssi,
  timestamp: $Activity.shape.timestamp,
})
export const $Devices = z.map(z.uuid(), $Device)

export const $SourceType = z.enum(['all', 'room', 'location', 'unallocated'])

const $DeviceCodec = $Device.extend({
  mac: macCodec,
  lastActivity: isoDatetimeToDate,
})

export const $DevicesMessage = z.codec(z.object({ DeviceList: z.array($DeviceCodec) }), $Devices, {
  decode: (input) => new Map(input.DeviceList.map((device) => [device.uuid, device])),
  encode: (data) => ({ DeviceList: Array.from(data.values()) }),
})

export const $DeviceRemoveMessage = z.codec(z.object({ DeviceRemove: z.uuid() }), z.uuid(), {
  decode: (input) => input.DeviceRemove,
  encode: (uuid) => ({ DeviceRemove: uuid }),
})

export const $DeviceRemovedMessage = z.codec(z.object({ DeviceRemoved: z.uuid() }), z.uuid(), {
  decode: (input) => input.DeviceRemoved,
  encode: (uuid) => ({ DeviceRemoved: uuid }),
})

export const $DeviceSetMessage = z.codec(z.object({ DeviceSet: $DeviceCodec }), $Device, {
  decode: (input) => input.DeviceSet,
  encode: (item) => ({ DeviceSet: item }),
})

export const $DeviceDetailMessage = z.codec(z.object({ DeviceDetail: $DeviceCodec }), $Device, {
  decode: (input) => input.DeviceDetail,
  encode: (item) => ({ DeviceDetail: item }),
})
