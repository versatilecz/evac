import * as z from 'zod'

export const APP_CONFIG = {
  name: 'EVAC',
  version: '1.0.0',
  description: 'Emergency Evacuation Management System',
} as const

export const MAC_BASE: 16 | 10 = 16

export const REGEX = {
  MAC: {
    16: /^[0-9a-f]{2}(?:[:-][0-9a-f]{2})*$/i,
    10: /^[0-9]{1,3}(?:[:-][0-9]{1,3})*$/,
  },
} as const

export const MacAddress = z.string().regex(REGEX.MAC[MAC_BASE]).describe('MAC address in string representation')
