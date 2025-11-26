<script setup lang="ts">
import { $SourceType, useDevices } from '@evac/devices'
import { useLocations } from '@evac/locations'
import { useRooms } from '@evac/rooms'
import { useScanners } from '@evac/scanners'
import { ContentHeader, Dialog, DialogActions, Icon, useAction } from '@evac/ui'
import { computed, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAlarms } from '@/composables'
import * as def from '@/definitions'
import { activeAlarmService } from '@/service'

defineOptions({ inheritAttrs: false })
const { t } = useI18n({ useScope: 'global' })

const formData = reactive(seed())

const { list: alarms } = useAlarms()
const { data: locationsData, list: locations } = useLocations()
const { data: roomsData, list: rooms } = useRooms({ location: () => formData.location })
const { data: scannersData, list: scanners } = useScanners({ room: () => formData.room })
const { data: devicesData } = useDevices()
const { list: roomDevices } = useDevices({ sourceType: $SourceType.enum.room, room: () => formData.room })
const { list: unallocatedDevices } = useDevices({ sourceType: $SourceType.enum.unallocated })
const devices = computed(() => [...roomDevices.value, ...unallocatedDevices.value])

const ready = computed(() => {
  return !!(formData.location && formData.room && formData.scanner && formData.device && formData.alarm)
})

watch(
  () => formData.location,
  () => (formData.room = '')
)
watch(
  () => formData.room,
  () => (formData.scanner = '')
)
watch(
  () => formData.scanner,
  () => (formData.device = '')
)

const create = useAction(() => {
  if (!ready.value) throw new Error('Form is not complete')

  const alarmData = collectActiveAlarmData()
  activeAlarmService.alarm(alarmData)
})

function collectActiveAlarmData(): def.AlarmInfoInput {
  const alarm = alarms.value.find((a) => a.uuid === formData.alarm)!

  return {
    alarm: alarm.uuid,
    location: locationsData.value.get(formData.location)!.name,
    room: roomsData.value.get(formData.room)!.name,
    scanner: scannersData.value.get(formData.scanner)!.name,
    device: devicesData.value.get(formData.device)!.name ?? '',
  } satisfies def.AlarmInfoInput
}

function reset() {
  Object.assign(formData, seed())
}

function seed() {
  return {
    location: '',
    room: '',
    scanner: '',
    device: '',
    alarm: '',
  }
}
</script>

<template>
  <Dialog.Root v-slot="{ close }">
    <Dialog.Trigger as-child>
      <slot name="trigger">
        <button type="button" class="btn" v-bind="$attrs">
          <Icon icon="add" />
        </button>
      </slot>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay class="overlay" />
      <Dialog.Content class="dialog" as="form">
        <ContentHeader>
          <template #title>
            <Icon class="size-8" :icon="def.ICON" />
            <Dialog.Title class="headline">{{ t('alarm.dialog.create', '') }}</Dialog.Title>
          </template>
          <template #description>
            <Dialog.Description class="description">{{ t('alarm.dialog.description', '') }}</Dialog.Description>
          </template>
        </ContentHeader>

        <div class="px-6 grid gap-4">
          <label class="label" for="active-alarm-location">
            <span class="label-text">{{ t('location.title') }}</span>

            <select id="active-alarm-location" v-model="formData.location" class="input w-full">
              <option disabled value="">{{ t('location.select.placeholder') }}</option>
              <template v-for="location of locations" :key="location.uuid">
                <option :value="location.uuid">{{ location.name }}</option>
              </template>
            </select>
          </label>

          <label class="label" for="active-alarm-room">
            <span class="label-text">{{ t('room.title') }}</span>

            <select id="active-alarm-room" v-model="formData.room" class="input w-full" :disabled="!formData.location">
              <option disabled value="">{{ t('room.select.placeholder') }}</option>
              <template v-for="room of rooms" :key="room.uuid">
                <option :value="room.uuid">{{ room.name }}</option>
              </template>
            </select>
          </label>

          <label class="label" for="active-alarm-scanner">
            <span class="label-text">{{ t('scanner.title') }}</span>

            <select id="active-alarm-scanner" v-model="formData.scanner" class="input w-full" :disabled="!formData.room">
              <option disabled value="">{{ t('scanner.select.placeholder') }}</option>
              <template v-for="scanner of scanners" :key="scanner.uuid">
                <option :value="scanner.uuid">{{ scanner.name }}</option>
              </template>
            </select>
          </label>

          <label class="label" for="active-alarm-device">
            <span class="label-text">{{ t('device.title') }}</span>

            <select id="active-alarm-device" v-model="formData.device" class="input w-full" :disabled="!devices.length">
              <option disabled value="">{{ t('device.select.placeholder') }}</option>
              <template v-for="device of devices" :key="device.uuid">
                <option :value="device.uuid">{{ device.name }}</option>
              </template>
            </select>
          </label>

          <label class="label" for="active-alarm-alarm">
            <span class="label-text">{{ t('alarm.title') }}</span>

            <select id="active-alarm-alarm" v-model="formData.alarm" class="input w-full" :disabled="!alarms.length">
              <option disabled value="">{{ t('alarm.select.placeholder') }}</option>
              <template v-for="alarm of alarms" :key="alarm.uuid">
                <option :value="alarm.uuid">{{ alarm.name }}</option>
              </template>
            </select>
          </label>
        </div>
        <DialogActions class="px-6" @cancel="reset()" @close="close" @create="create.submit().then(close)" />
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</template>
