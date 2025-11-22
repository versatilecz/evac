import { useDevice } from '@evac/devices'
import { useLocation } from '@evac/locations'
import { useRoom } from '@evac/rooms'
import { useScanner } from '@evac/scanners'
import { useAction } from '@evac/ui'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useI18n } from 'vue-i18n'
import { service } from '@/service'
import { $Event } from '@/definitions'
import { useEvents } from './list'

export function useEvent(uuid: MaybeRefOrGetter<$Event['uuid']>) {
  const { t } = useI18n({ useScope: 'global' })
  const { data } = useEvents()
  const event = computed(() => data.value.get(toValue(uuid)) ?? null)

  const { device } = useDevice(() => event.value?.device ?? '')
  const { scanner } = useScanner(() => event.value?.scanner ?? '')
  const { room } = useRoom(() => scanner.value?.room ?? '')
  const { location } = useLocation(() => room.value?.location ?? '')
  const kindLabel = computed(() => (event.value ? t(`event.${event.value.kind}`, '') : ''))

  return {
    event,
    device,
    scanner,
    room,
    location,
    remove: useAction(() => service.remove($Event.parse(event.value).uuid)),
    kindLabel,
  }
}
