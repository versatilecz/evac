<script setup lang="ts">
import { Badge, ContentHeader, Dialog, DialogActions, Entity, Icon, Switch, useFormat } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { useDeviceForm } from '@/composables'
import { ICON, $Device } from '@/definitions'
import BatteryBadge from '../BatteryBadge.vue'

defineProps<{ device: $Device }>()
defineOptions({ inheritAttrs: false })
const { t } = useI18n({ useScope: 'global' })
const formatter = useFormat()
const { title, formData, hasData, hasChanges, reset, set, remove, update } = useDeviceForm()
</script>

<template>
  <Dialog.Root v-slot="{ close }" @update:open="$event && device ? set(device) : reset()">
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
      <Dialog.Content class="dialog" as="form">
        <input v-if="hasData" type="text" autofocus tabindex="0" class="sr-only" :aria-label="title" />
        <ContentHeader :icon="ICON">
          <template #title>
            <Dialog.Title class="headline grow">
              <span class="sr-only" v-text="title" />
              <label for="device-name" class="sr-only" v-text="t('entity.name')" />
              <input id="device-name" v-model="formData.name" class="input" type="text" :placeholder="t('entity.name')" />
            </Dialog.Title>
          </template>
          <template #description>
            <Dialog.Description class="paragraph description">{{ t('device.dialog.description', '') }}</Dialog.Description>
          </template>
          <template #row>
            <Entity.UuidBadge :entity="device" />
          </template>
        </ContentHeader>

        <div class="px-6 grid gap-4">
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
        </div>
        <DialogActions class="px-6" :has-data="hasData" :has-changes="hasChanges" @cancel="reset()" @close="close" @remove="remove.submit(close)" @update="update.submit()" />
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</template>
