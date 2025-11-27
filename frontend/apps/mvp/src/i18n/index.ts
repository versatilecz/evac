import { messages } from '@evac/shared'
import * as Auth from '@evac/auth'
import { messages as alarmsMessages } from '@evac/alarms'
import { messages as configMessages } from '@evac/config'
import { messages as devicesMessages } from '@evac/devices'
import { messages as eventsMessages } from '@evac/events'
import { Contact, ContactGroup, Location, Notification } from '@evac/entities'
import { messages as roomsMessages } from '@evac/rooms'
import { messages as scannersMessages } from '@evac/scanners'
import { createI18n } from 'vue-i18n'

export default createI18n({
  legacy: false,
  locale: 'cs',
  fallbackLocale: 'en',
  messages: mergeMessages(
    Auth.i18n,
    messages,
    eventsMessages,
    configMessages,
    alarmsMessages,
    devicesMessages,
    Notification.i18n,
    Location.i18n,
    roomsMessages,
    scannersMessages,
    Contact.i18n,
    ContactGroup.i18n
  ),
})

function mergeMessages(...sources: Record<string, any>[]) {
  const output: Record<string, any> = {}

  // Only first level is merged, deeper levels are replaced
  for (const source of sources) {
    for (const [key, value] of Object.entries(structuredClone(source))) {
      output[key] = { ...(output[key] ?? null), ...value }
    }
  }

  return output
}
