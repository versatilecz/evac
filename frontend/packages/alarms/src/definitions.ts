import * as z from 'zod'

export type $Alarm = z.infer<typeof $Alarm>
export type $Alarms = z.infer<typeof $Alarms>
export type $AlarmFormData = z.infer<typeof $AlarmFormData>

export const ICON = 'detector_alarm'
export const SCOPE = 'alarms'

export const $Alarm = z.object({
  name: z.string(),
  uuid: z.uuidv4(),
  subject: z.string(),
  text: z.string(),
  html: z.string(),
  buzzer: z.boolean(),
  led: z.boolean(),
})

export const $Alarms = z.map(z.uuidv4(), $Alarm)
export const $AlarmFormData = $Alarm.omit({ uuid: true })
const $AlarmCodec = $Alarm

export const $AlarmsMessage = z.codec(z.object({ AlarmList: z.array($AlarmCodec) }), $Alarms, {
  decode: (input) => new Map(input.AlarmList.map((item) => [item.uuid, item])),
  encode: (data) => ({ AlarmList: Array.from(data.values()) }),
})

export const $AlarmRemoveMessage = z.codec(z.object({ AlarmRemove: z.uuidv4() }), z.uuidv4(), {
  decode: (input) => input.AlarmRemove,
  encode: (uuid) => ({ AlarmRemove: uuid }),
})

export const $AlarmRemovedMessage = z.codec(z.object({ AlarmRemoved: z.uuidv4() }), z.uuidv4(), {
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
