import { defineService } from '@evac/shared'
import { SCOPE, UserInfo } from './definitions'

export const service = defineService({
  name: SCOPE,
  identity: UserInfo,
}).withSources(
  async function* onUserInfo(source) {
    for await (const message of source) {
      const parsed = UserInfo.safeParse(message)
      if (!parsed.success) continue
      yield parsed.data
    }
  }
)
