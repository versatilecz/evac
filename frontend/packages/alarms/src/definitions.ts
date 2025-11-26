import { SortDirection, type SortRule } from '@evac/shared'
import * as z from 'zod'

export type $Alarm = z.infer<typeof $Alarm>
export type $Alarms = z.infer<typeof $Alarms>
export type $AlarmFormData = z.infer<typeof $AlarmFormData>
export type AlarmInfo = z.output<typeof AlarmInfo>
export type AlarmInfoInput = z.input<typeof AlarmInfoInput>

export const ICON = 'detector_alarm'
export const SCOPE = 'alarms'
export const DEFAULT_SORT: SortRule = { key: 'name', direction: SortDirection.enum.Ascending }

export const $Alarm = z.object({
  name: z.string(),
  uuid: z.uuid(),
  notification: z.string(),
  buzzer: z.boolean(),
  led: z.boolean(),
  group: z.uuid().describe('Contact group to notify when alarm is triggered'),
})

export const AlarmInfo = z.object({
  uuid: z.uuid(),
  alarm: z.uuid(),
  device: z.string(),
  scanner: z.string(),
  location: z.string(),
  room: z.string(),
})
export const AlarmInfoInput = AlarmInfo.extend({
  uuid: AlarmInfo.shape.uuid.default(() => crypto.randomUUID()),
})

export const $ActiveAlarmState = z.union([AlarmInfo, z.undefined(), z.null()])

export const $Alarms = z.map(z.uuid(), $Alarm)
export const $AlarmFormData = $Alarm.omit({ uuid: true })
const $AlarmCodec = $Alarm

export const $AlarmsMessage = z.codec(z.object({ AlarmList: z.array($AlarmCodec) }), $Alarms, {
  decode: (input) => new Map(input.AlarmList.map((item) => [item.uuid, item])),
  encode: (data) => ({ AlarmList: Array.from(data.values()) }),
})

export const $AlarmRemoveMessage = z.codec(z.object({ AlarmRemove: z.uuid() }), z.uuid(), {
  decode: (input) => input.AlarmRemove,
  encode: (uuid) => ({ AlarmRemove: uuid }),
})

export const $AlarmRemovedMessage = z.codec(z.object({ AlarmRemoved: z.uuid() }), z.uuid(), {
  decode: (input) => input.AlarmRemoved,
  encode: (uuid) => ({ AlarmRemoved: uuid }),
})

export const $AlarmSetMessage = z.codec(z.object({ AlarmSet: $AlarmCodec }), $Alarm, {
  decode: (input) => input.AlarmSet,
  encode: (item) => ({ AlarmSet: item }),
})

export const $AlarmDetailMessage = z.codec(z.object({ AlarmDetail: $AlarmCodec }), $Alarm, {
  decode: (input) => input.AlarmDetail,
  encode: (item) => ({ AlarmDetail: item }),
})

export const $AlarmMessage = z.codec(z.object({ Alarm: AlarmInfo }), AlarmInfo, {
  decode: (input) => input.Alarm,
  encode: (data) => ({ Alarm: data }),
})

export const $AlarmStopMessage = z.codec(z.object({ AlarmStop: z.uuid() }), z.uuid(), {
  decode: (input) => input.AlarmStop,
  encode: (data) => ({ AlarmStop: data }),
})
