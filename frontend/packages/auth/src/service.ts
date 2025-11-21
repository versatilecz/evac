import { defineService } from '@evac/shared'
import { SCOPE, UserInfo, UserInfoMessage } from './definitions'

export const service = defineService({
  name: SCOPE,
  identity: UserInfo,
}).withSources(
  async function* onUserInfo(source) {
    for await (const message of source) {
      const parsed = UserInfoMessage.safeParse(message)
      if (!parsed.success) continue
      yield parsed.data
    }
  }
)
