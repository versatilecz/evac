import * as z from 'zod'

export const SCOPE = 'auth'

export type Auth = z.infer<typeof Auth>
export type Role = z.infer<typeof Role>
export type UserInfo = z.output<typeof UserInfo>

export const Role = z.enum(['Anonymous', 'Admin', 'Service', 'External'])
export const ValidRoles = new Set(Role.options.filter((r) => r !== 'Anonymous'))

export const UserInfo = z.object({
  username: z.string(),
  roles: z.codec(z.array(Role), z.set(Role), {
    decode: (roles) => new Set(roles),
    encode: (roles) => Array.from(roles),
  }),
})

export const Auth = z.object({
  isAuthenticated: z.boolean(),
  isAdmin: z.boolean(),
  isDebug: z.boolean(),
  isUser: z.boolean(),
  isExternal: z.boolean(),
})
