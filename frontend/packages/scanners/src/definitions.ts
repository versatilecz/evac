import { $MacAddress, macCodec, isoDatetimeToDate, SortDirection, type SortRule } from '@evac/shared'
import * as z from 'zod'

export type $Scanner = z.infer<typeof $Scanner>
export type $Scanners = z.infer<typeof $Scanners>

export const ICON = 'infrared'
export const SCOPE = 'scanners'
export const DEFAULT_SORT: SortRule = { key: 'name', direction: SortDirection.enum.Ascending }

export const $PortNumber = z
  .number()
  .min(0)
  .max(2 ** 16 - 1)

export const $Scanner = z.object({
  uuid: z.uuid(),
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

export const $Scanners = z.map(z.uuid(), $Scanner)

const $ScannerCodec = $Scanner.omit({ mac: true, lastActivity: true }).extend({
  mac: macCodec,
  lastActivity: isoDatetimeToDate,
})

export const $ScannersMessage = z.codec(z.object({ ScannerList: z.array($ScannerCodec) }), $Scanners, {
  decode: (data) => new Map(data.ScannerList.map((scanner) => [scanner.uuid, scanner])),
  encode: (scanners) => ({ ScannerList: Array.from(scanners.values()) }),
})

export const $ScannerRemoveMessage = z.codec(z.object({ ScannerRemove: z.uuid() }), z.uuid(), {
  decode: (data) => data.ScannerRemove,
  encode: (uuid) => ({ ScannerRemove: uuid }),
})

export const $ScannerRemovedMessage = z.codec(z.object({ ScannerRemoved: z.uuid() }), z.uuid(), {
  decode: (data) => data.ScannerRemoved,
  encode: (uuid) => ({ ScannerRemoved: uuid }),
})

export const $ScannerSetMessage = z.codec(z.object({ ScannerSet: $ScannerCodec }), $Scanner, {
  decode: (data) => data.ScannerSet,
  encode: (scanner) => ({ ScannerSet: scanner }),
})

export const $ScannerDetailMessage = z.codec(z.object({ ScannerDetail: $ScannerCodec }), $Scanner, {
  decode: (data) => data.ScannerDetail,
  encode: (scanner) => ({ ScannerDetail: scanner }),
})
