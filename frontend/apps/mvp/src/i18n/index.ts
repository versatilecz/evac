import { messages } from '@evac/shared'
import { messages as alarmsMessages } from '@evac/alarms'
import { messages as configMessages } from '@evac/config'
import { messages as devicesMessages } from '@evac/devices'
import { messages as emailsMessages } from '@evac/emails'
import { messages as locationsMessages } from '@evac/locations'
import { messages as roomsMessages } from '@evac/rooms'
import { messages as scannersMessages } from '@evac/scanners'
import { mergeDeep, pipe } from 'remeda'
import { createI18n } from 'vue-i18n'

export default createI18n({
  legacy: false,
  locale: 'cs',
  fallbackLocale: 'en',
  messages: pipe(messages, mergeDeep(configMessages), mergeDeep(alarmsMessages), mergeDeep(devicesMessages), mergeDeep(emailsMessages), mergeDeep(locationsMessages), mergeDeep(roomsMessages), mergeDeep(scannersMessages)),
})
