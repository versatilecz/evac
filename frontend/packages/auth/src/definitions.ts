import { isoDatetimeToDate } from '@evac/shared'
import * as z from 'zod'

export const SCOPE = 'auth'
export const DEFAULT_USERNAME = 'Anonymous'

export type Auth = z.infer<typeof Auth>
export type Role = z.infer<typeof Role>
export type UserInfo = z.infer<typeof UserInfo>
export type LoginCredentials = z.infer<typeof LoginCredentials>
export type TokenDetail = z.infer<typeof TokenDetail>

export const Role = z.enum(['Anonymous', 'Admin', 'Service', 'External'])

export const validRoles = new Set<Role>(Role.options.filter((r) => r !== 'Anonymous'))
export const adminRoles = new Set<Role>([Role.enum.Admin])
export const serviceRoles = new Set<Role>([Role.enum.Admin, Role.enum.Service])
export const dashboardRoles = new Set<Role>([Role.enum.Admin, Role.enum.Service, Role.enum.External])

export const UserInfo = z.object({
  uuid: z.uuid(),
  username: z.string(),
  roles: z.set(Role),
})

export const UserInfoCodec = z.object({
  uuid: z.uuid(),
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

export const TokenDetail = z.object({
  nonce: z.string(),
  user: z.uuid(),
  isValid: z.boolean(),
  created: z.date(),
})

export const TokenDetailCodec = z.codec(
  TokenDetail.omit({ isValid: true }).extend({
    created: isoDatetimeToDate,
    is_valid: z.boolean(),
  }),
  TokenDetail,
  {
    decode: (input) => ({
      nonce: input.nonce,
      user: input.user,
      isValid: input.is_valid,
      created: input.created,
    }),
    encode: (item) => ({
      nonce: item.nonce,
      user: item.user,
      is_valid: item.isValid,
      created: item.created,
    }),
  }
)

export const LoginCredentials = z.object({
  username: z.string(),
  password: z.string(),
})

export const UserInfoMessage = z.codec(z.object({ UserInfo: UserInfoCodec }), UserInfo, {
  decode: (input) => input.UserInfo,
  encode: (item) => ({ UserInfo: item }),
})
export const LoginMessage = z.codec(z.object({ Login: z.object({ Login: LoginCredentials }) }), LoginCredentials, {
  decode: (input) => input.Login.Login,
  encode: (item) => ({ Login: { Login: item } }),
})
export const LogoutMessage = z.codec(z.object({ Logout: z.null() }), z.null(), {
  decode: () => null,
  encode: () => ({ Logout: null }),
})
export const TokenGetForUserMessage = z.codec(z.object({ TokenGetForUser: z.uuid() }), z.uuid(), {
  decode: (input) => input.TokenGetForUser,
  encode: (item) => ({ TokenGetForUser: item }),
})
export const TokenMessage = z.codec(z.object({ Login: z.object({ Token: z.string() }) }), z.string(), {
  decode: (input) => input.Login.Token,
  encode: (item) => ({ Login: { Token: item } }),
})
export const TokenGetMessage = z.codec(z.object({ TokenGet: z.string().nullish() }), z.string().nullish(), {
  decode: (input) => input.TokenGet ?? '',
  encode: (item) => ({ TokenGet: item ?? null }),
})
export const TokenDetailMessage = z.codec(z.object({ TokenDetail: TokenDetailCodec }), TokenDetail, {
  decode: (input) => input.TokenDetail,
  encode: (item) => ({ TokenDetail: item }),
})
