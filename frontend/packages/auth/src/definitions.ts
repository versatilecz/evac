import * as z from 'zod'

export const SCOPE = 'auth'
export const DEFAULT_USERNAME = 'Anonymous'

export type Auth = z.infer<typeof Auth>
export type Role = z.infer<typeof Role>
export type UserInfo = z.infer<typeof UserInfo>

export const Role = z.enum(['Anonymous', 'Admin', 'Service', 'External'])

export const validRoles = new Set<Role>(Role.options.filter((r) => r !== 'Anonymous'))
export const adminRoles = new Set<Role>([Role.enum.Admin])
export const serviceRoles = new Set<Role>([Role.enum.Admin, Role.enum.Service])
export const dashboardRoles = new Set<Role>([Role.enum.Admin, Role.enum.Service, Role.enum.External])

export const UserInfo = z.object({
  username: z.string(),
  roles: z.set(Role),
})

export const UserInfoCodec = z.object({
  username: z.string(),
  roles: z.codec(z.array(Role), z.set(Role), {
    decode: (roles) => new Set(roles),
    encode: (roles) => Array.from(roles),
  }),
})

export const Auth = z.object({
  isAuthenticated: z.boolean(),
  isAdmin: z.boolean(),
  isService: z.boolean(),
  isDashboard: z.boolean(),
})

export const UserInfoMessage = z.codec(z.object({ UserInfo: UserInfoCodec }), UserInfo, {
  decode: (input) => input.UserInfo,
  encode: (item) => ({ UserInfo: item }),
})
