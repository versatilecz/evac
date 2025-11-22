<script setup lang="ts">
import { activeAlarmService, useActiveAlarm, useAlarms, type AlarmInfoInput } from '@evac/alarms'
import { Badge, ContentHeader, Dialog, Entity, Icon, useAction, useFormat } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { $Event } from '@/definitions'
import { useEvent } from '@/composables'
import IconByKind from './IconByKind.vue'

const props = defineProps<{ event: $Event }>()
defineOptions({ inheritAttrs: false })
const { t } = useI18n({ useScope: 'global' })
const formatter = useFormat()
const { device, scanner, room, location, kindLabel, remove } = useEvent(() => props.event.uuid)
const { list: alarms } = useAlarms()
const { data: activeAlarm } = useActiveAlarm()

const createAlarm = useAction(async (alarmUuid: string) => {
  const alarmInfo = collectAlarmInfo(alarmUuid)
  await activeAlarmService.alarm(alarmInfo)
})

function confirmAndRemove(cb?: () => any) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      if (!confirm(t('event.dialog.confirmDelete', ''))) {
        resolve()
        return
      }
      remove
        .submit()
        .then(() => (cb ? cb() : void 0))
        .then(resolve)
    })
  })
}

function collectAlarmInfo(alarmUuid: string): AlarmInfoInput {
  return {
    alarm: alarmUuid,
    location: location.value?.name ?? '',
    room: room.value?.name ?? '',
    scanner: scanner.value?.name ?? '',
    device: device.value?.name ?? '',
  } satisfies AlarmInfoInput
}
</script>

<template>
  <Dialog.Root v-slot="{ close }">
    <Dialog.Trigger as-child>
      <slot />
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay class="overlay" />
      <Dialog.Content class="dialog" as="form">
        <ContentHeader>
          <template #title>
            <IconByKind class="size-6 mx-3 row-span-2" :kind="event.kind" />
            <Dialog.Title class="headline grow"> {{ kindLabel }}</Dialog.Title>
          </template>
          <template #description>
            <Dialog.Description class="description">{{ t('device.dialog.description', '') }}</Dialog.Description>
          </template>
          <template #row>
            <Entity.UuidBadge :entity="event" />
          </template>
        </ContentHeader>

        <div class="px-6 flex gap-3">
          <Entity.Breadcrumbs v-slot="{ delimiter, rest, last }" :location="location?.name" :room="room?.name" :scanner="scanner?.name" :device="device?.name">
            <Badge class="px-6 text-center grow">
              <template v-if="rest.length">{{ rest + delimiter }}</template>
              <strong>{{ last }}</strong>
            </Badge>
          </Entity.Breadcrumbs>

          <Badge>{{ formatter.dateTime.format(event.timestamp) }}</Badge>
        </div>

        <div v-if="!activeAlarm" class="mt-6 px-6 flex flex-wrap gap-3">
          <template v-for="alarm of alarms" :key="alarm.uuid">
            <button type="button" class="btn btn-filled" @click="createAlarm.submit(alarm.uuid).finally(close)">{{ alarm.name }}</button>
          </template>
        </div>

        <div class="flex gap-4 justify-between p-6">
          <button class="btn text-accent-red" type="button" @click="confirmAndRemove(close)">
            <Icon icon="delete" />
            {{ t('action.delete') }}
          </button>

          <button class="btn" type="button" @click="close()">
            <Icon icon="close" />
            {{ t('action.close') }}
          </button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</template>
