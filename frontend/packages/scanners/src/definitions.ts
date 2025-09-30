import { MacAddress, macCodec, isoDatetimeToDate } from '@evac/shared'
import * as z from 'zod'

export type $Scanner = z.infer<typeof Scanner>
export type $Scanners = z.infer<typeof Scanners>

export const SCOPE = 'scanners'

export const PortNumber = z
  .number()
  .min(0)
  .max(2 ** 16 - 1)

export const Scanner = z.object({
  name: z.string(),
  uuid: z.uuidv4(),
  room: z.uuid().describe('The UUID of the room this scanner belongs to'),
  ip: z.ipv4().or(z.ipv6()),
  port: PortNumber,
  mac: MacAddress,
  buzzer: z.boolean(),
  scan: z.boolean(),
  led: z.boolean(),
  lastActivity: z.date(),
})

export const Scanners = z.map(z.uuidv4(), Scanner)

const ScannerCodec = Scanner.omit({ mac: true, lastActivity: true }).extend({
  mac: macCodec,
  lastActivity: isoDatetimeToDate,
})

export const ScannersMessage = z.codec(z.object({ ScannerList: z.array(ScannerCodec) }), Scanners, {
  decode: (data) => new Map(data.ScannerList.map((scanner) => [scanner.uuid, scanner])),
  encode: (scanners) => ({ ScannerList: Array.from(scanners.values()) }),
})
