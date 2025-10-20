import * as z from 'zod'
import { MAC_BASE, $MacAddress } from './definitions'

const numberConversions = {
  16: {
    decode: (x: number) => Number(x).toString(16).padStart(2, '0'),
    encode: (x: string) => parseInt(x, 16),
  },
  10: {
    decode: (x: number) => Number(x).toString(10),
    encode: (x: string) => parseInt(x, 10),
  },
} as const

export const macCodec = z.codec(z.array(z.number()), $MacAddress, {
  decode: (data) => data.map(numberConversions[MAC_BASE].decode).join(':'),
  encode: (x) => x.split(':').map(numberConversions[MAC_BASE].encode),
})

export const isoDatetimeToDate = z.codec(z.iso.datetime(), z.date(), {
  decode: (isoString) => new Date(isoString),
  encode: (date) => date.toISOString(),
})
