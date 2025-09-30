import * as z from 'zod'

export type $EmailConfig = z.infer<typeof EmailConfig>
export type $Email = z.infer<typeof Email>

export const Email = z.object({
  name: z.string().min(1),
  address: z.email({ pattern: z.regexes.html5Email }),
})

export const EmailConfig = z.object({
  from: Email,
  password: z.string().min(1),
  port: z.number().min(1).max(65535).default(587),
  server: z.string().min(1).default('smtp'),
  tls: z.boolean().default(false),
  to: z.array(Email),
  username: z.string().min(1),
})

export const EmailCodec = z.codec(
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

export const EmailConfigCodec = EmailConfig.omit({ from: true, to: true }).extend({
  from: EmailCodec,
  to: z.array(EmailCodec).min(1),
})
