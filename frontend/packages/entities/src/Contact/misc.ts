import * as def from './definitions'

const kindIdentifiers = new Map<def.KindIdentifier, (data: def.FormData) => boolean>([
  ['email', isEmailKind],
  ['sms', isSmsKind],
])

export function getKind(data: def.FormData): def.KindIdentifier {
  for (const [key, isKind] of kindIdentifiers) {
    if (!isKind(data)) continue
    return key
  }
  throw new Error('Unknown kind')
}

export function isEmailKind(data: def.FormData): data is def.FormData & { kind: def.EmailKind } {
  return def.EmailKind.safeParse(data.kind).success
}
export function isSmsKind(data: def.FormData): data is def.FormData & { kind: def.SmsKind } {
  return def.SmsKind.safeParse(data.kind).success
}
