import { defineService } from '@evac/shared'
import * as def from './definitions'

export const tokenDetail = defineService({
  name: `${def.SCOPE}/tokenDetail`,
  identity: def.TokenDetail.nullable(),
})
  .withSources(async function* onTokenDetail(source) {
    for await (const message of source) {
      const parsed = def.TokenDetailMessage.safeParse(message)
      if (!parsed.success) continue
      yield parsed.data
    }
  })
  .withActions({
    getToken(source, nonce: string | null | undefined) {
      source.send(def.TokenGetMessage.encode(nonce))
    },
    getTokenForUser(source, uuid: def.UserInfo['uuid']) {
      source.send(def.TokenGetForUserMessage.encode(uuid))
    },
  })

export const userInfo = defineService({
  name: `${def.SCOPE}/userInfo`,
  identity: def.UserInfo.nullable(),
})
  .withSources(async function* onUserInfo(source) {
    for await (const message of source) {
      const parsed = def.UserInfoMessage.safeParse(message)
      if (!parsed.success) continue

      const userInfo = parsed.data
      tokenDetail.getTokenForUser(userInfo.uuid)
      yield userInfo
    }
  })
  .withActions({
    login(source, credentials: def.LoginCredentials) {
      source.send(def.LoginMessage.encode(credentials))
    },
    token(source, nonce: string | null | undefined) {
      source.send(def.TokenMessage.encode(nonce ?? ''))
    },
    logout(source) {
      source.send(def.LogoutMessage.encode(null))
      this.set(null)
      tokenDetail.set(null)
    },
  })
