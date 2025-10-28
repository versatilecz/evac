import { $MacAddress, macCodec, isoDatetimeToDate } from '@evac/shared'
import * as z from 'zod'

export type $Device = z.infer<typeof $Device>
export type $Devices = z.infer<typeof $Devices>

export const ICON = 'devices_wearables'
export const SCOPE = 'devices'

export const $Device = z.object({
  name: z.string(),
  uuid: z.uuidv4(),
  mac: $MacAddress,
  lastActivity: z.date(),
  enabled: z.boolean(),
  battery: z.number().min(0).max(100).nullable(),
})

export const $Devices = z.map(z.uuidv4(), $Device)

const $DeviceCodec = $Device.omit({ mac: true, lastActivity: true }).extend({
  mac: macCodec,
  lastActivity: isoDatetimeToDate,
})

export const $DevicesMessage = z.codec(z.object({ DeviceList: z.array($DeviceCodec) }), $Devices, {
  decode: (data) => new Map(data.DeviceList.map((device) => [device.uuid, device])),
  encode: (devices) => ({ DeviceList: Array.from(devices.values()) }),
})

export const $DeviceRemoveMessage = z.codec(z.object({ DeviceRemove: z.uuidv4() }), z.uuidv4(), {
  decode: (data) => data.DeviceRemove,
  encode: (uuid) => ({ DeviceRemove: uuid }),
})

export const $DeviceRemovedMessage = z.codec(z.object({ DeviceRemoved: z.uuidv4() }), z.uuidv4(), {
  decode: (data) => data.DeviceRemoved,
  encode: (uuid) => ({ DeviceRemoved: uuid }),
})

export const $DeviceSetMessage = z.codec(z.object({ DeviceSet: $DeviceCodec }), $Device, {
  decode: (data) => data.DeviceSet,
  encode: (device) => ({ DeviceSet: device }),
})

export const $DeviceDetailMessage = z.codec(z.object({ DeviceDetail: $DeviceCodec }), $Device, {
  decode: (data) => data.DeviceDetail,
  encode: (scanner) => ({ DeviceDetail: scanner }),
})
