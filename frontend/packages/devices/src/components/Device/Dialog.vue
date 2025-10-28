<script setup lang="ts">
import { Badge, ContentHeader, Dialog, DialogActions, Icon, Switch, useFormat } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { useDeviceForm } from '@/composables'
import { $Device } from '@/definitions'
import BatteryBadge from '../BatteryBadge.vue'

const props = defineProps<{ device: $Device }>()
defineOptions({ inheritAttrs: false })
const { t } = useI18n({ useScope: 'global' })
const formatter = useFormat()
const { title, formData, hasData, hasChanges, reset, remove, update } = useDeviceForm(() => props.device)
</script>

<template>
  <Dialog.Root v-slot="{ close }">
    <Dialog.Trigger as-child>
      <slot>
        <button type="button" class="btn" v-bind="$attrs">
          <Icon v-if="device" icon="edit" />
          <Icon v-else icon="add" />
        </button>
      </slot>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay class="overlay" />
      <Dialog.Content class="dialog">
        <ContentHeader>
          <template #title>
            <Icon class="size-8" icon="location_on" />
            <Dialog.Title class="headline">{{ title }}</Dialog.Title>
          </template>
          <template #description>
            <Dialog.Description class="description">{{ t('device.dialog.description', '') }}</Dialog.Description>
          </template>
        </ContentHeader>

        <form class="px-6 grid gap-4">
          <label class="labe" for="device-name">
            <span class="label-text">{{ t('entity.name') }}</span>
            <input id="device-name" v-model="formData.name" class="input w-full" type="text" />
          </label>

          <div class="flex gap-4 justify-between">
            <Badge>{{ t('entity.mac') }} {{ formData.mac }}</Badge>
            <Badge>{{ t('entity.activity') }} {{ formatter.dateTime.format(formData.lastActivity) }}</Badge>
            <BatteryBadge :battery="formData.battery">
              <template #label>{{ t('entity.battery') }}</template>
            </BatteryBadge>
          </div>

          <div class="flex gap-4 justify-around">
            <label class="label grid gap-1 justify-items-center" for="device-enabled">
              <span class="label-text">{{ t('entity.enabled') }}</span>
              <Switch.Root id="device-enabled" v-model="formData.enabled" class="btn switch">
                <Switch.Thumb class="thumb" />
              </Switch.Root>
            </label>
          </div>
        </form>
        <DialogActions class="px-6" :has-data="hasData" :has-changes="hasChanges" @cancel="reset()" @close="close" @remove="remove.submit(close)" @update="update.submit()" />
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</template>
