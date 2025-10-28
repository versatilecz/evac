import * as z from 'zod'

export type $Backup = z.infer<typeof $Backup>
export type $Backups = z.infer<typeof $Backups>

export const SCOPE = 'backups'

export const $Backup = z.string()
export const $Backups = z.set(z.string())

export const $BackupMessage = z.codec(z.object({ Backup: z.string() }), z.string(), {
  decode: (data) => data.Backup,
  encode: (name) => ({ Backup: name }),
})

export const $BackupListMessage = z.codec(z.object({ BackupList: z.array($Backup) }), $Backups, {
  decode: (data) => new Set(data.BackupList),
  encode: (list) => ({ BackupList: [...list] }),
})

export const $BackupRemoveMessage = z.codec(z.object({ BackupRemove: z.string() }), z.string(), {
  decode: (data) => data.BackupRemove,
  encode: (name) => ({ BackupRemove: name }),
})

export const $Restore = z.codec(z.object({ Restore: z.string() }), z.string(), {
  decode: (data) => data.Restore,
  encode: (name) => ({ Restore: name }),
})
