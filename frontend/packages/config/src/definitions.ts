import * as z from 'zod'
import { $BaseConfig } from './base/definitions'
import { EmailConfig, EmailConfigCodec } from './email/definitions'

export const CONFIG_ICON = 'settings'
export const TOOLS_ICON = 'construction'
export const SCOPE = 'config'

export type $ConfigMessage = z.infer<typeof $ConfigMessage>
export type $AppConfig = z.infer<typeof $AppConfig>

export const $AppConfig = z.object({
  base: $BaseConfig,
  email: EmailConfig,
})

const $AppConfigCodec = z.object({
  base: $BaseConfig,
  email: EmailConfigCodec,
})

export const $ConfigMessage = z.object({
  Config: $AppConfigCodec,
})
