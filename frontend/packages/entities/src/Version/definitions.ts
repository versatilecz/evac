import * as z from 'zod'

export type Backend = z.infer<typeof Backend>
export type VersionMessage = z.infer<typeof VersionMessage>

export const SCOPE = 'version'

export const Backend = z.object({
  commit: z.string(),
  number: z.string(),
})

export const VersionMessage = z.codec(z.object({ Version: Backend }), Backend, {
  decode: (input) => input.Version,
  encode: (item) => ({ Version: item }),
})
