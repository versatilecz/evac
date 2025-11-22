import * as z from 'zod'

export type $EmailConfig = z.output<typeof $EmailConfig>
export type $Email = z.infer<typeof $Email>
export type $SmsConfig = z.infer<typeof $SmsConfig>
export type $NotificationConfig = z.output<typeof $NotificationConfig>

export const $Email = z.object({
  name: z.string().min(1),
  address: z.email({ pattern: z.regexes.html5Email }),
})

export const $EmailCodec = z.codec(
  z.tuple([z.string(), z.email({ pattern: z.regexes.html5Email })]),
  z.object({
    name: z.string().min(1),
    address: z.email({ pattern: z.regexes.html5Email }),
  }),
  {
    decode: ([name, address]) => ({ name, address }),
    encode: ({ name, address }) => [name, address] as [string, string],
  }
)

export const $EmailConfig = z.object({
  from: $Email,
  password: z.string().min(1),
  port: z.number().min(1).max(65535).default(587),
  server: z.string().min(1).default('smtp'),
  tls: z.boolean().default(false),
  username: z.string().min(1),
})

export const $EmailConfigCodec = $EmailConfig.extend({
  from: $EmailCodec,
})

export const $SmsConfig = z.object({
  auth: z.string(),
  login: z.string(),
  url: z.string(), // TODO: change to z.url() when backend supports validation
})

export const $NotificationConfig = z.object({
  email: $EmailConfig,
  sms: $SmsConfig,
})

export const $NotificationConfigCodec = z.object({
  email: $EmailConfigCodec,
  sms: $SmsConfig,
})
