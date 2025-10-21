import { $MacAddress, macCodec, isoDatetimeToDate } from '@evac/shared'
import * as z from 'zod'

export type $Scanner = z.infer<typeof $Scanner>
export type $Scanners = z.infer<typeof $Scanners>

export const ICON = 'infrared'
export const SCOPE = 'scanners'

export const $PortNumber = z
  .number()
  .min(0)
  .max(2 ** 16 - 1)

export const $Scanner = z.object({
  uuid: z.uuidv4(),
  name: z.string().min(1, { message: 'validation.required' }),
  room: z.uuid().describe('The UUID of the room this scanner belongs to'),
  ip: z.ipv4().or(z.ipv6()),
  port: $PortNumber,
  mac: $MacAddress,
  buzzer: z.boolean(),
  scan: z.boolean(),
  led: z.boolean(),
  lastActivity: z.date(),
})

export const $Scanners = z.map(z.uuidv4(), $Scanner)

const $ScannerCodec = $Scanner.omit({ mac: true, lastActivity: true }).extend({
  mac: macCodec,
  lastActivity: isoDatetimeToDate,
})

export const $ScannersMessage = z.codec(z.object({ ScannerList: z.array($ScannerCodec) }), $Scanners, {
  decode: (data) => new Map(data.ScannerList.map((scanner) => [scanner.uuid, scanner])),
  encode: (scanners) => ({ ScannerList: Array.from(scanners.values()) }),
})

export const $ScannerRemoveMessage = z.codec(z.object({ ScannerRemove: z.uuidv4() }), z.uuidv4(), {
  decode: (data) => data.ScannerRemove,
  encode: (uuid) => ({ ScannerRemove: uuid }),
})

export const $ScannerRemovedMessage = z.codec(z.object({ ScannerRemoved: z.uuidv4() }), z.uuidv4(), {
  decode: (data) => data.ScannerRemoved,
  encode: (uuid) => ({ ScannerRemoved: uuid }),
})

export const $ScannerSetMessage = z.codec(z.object({ ScannerSet: $Scanner }), $Scanner, {
  decode: (data) => data.ScannerSet,
  encode: (scanner) => ({ ScannerSet: scanner }),
})

export const $ScannerDetailMessage = z.codec(z.object({ ScannerDetail: $Scanner }), $Scanner, {
  decode: (data) => data.ScannerDetail,
  encode: (scanner) => ({ ScannerDetail: scanner }),
})
