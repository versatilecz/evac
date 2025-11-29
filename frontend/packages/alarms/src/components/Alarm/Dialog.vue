<script setup lang="ts">
import { ContactGroup, Notification } from '@evac/entities'
import { ContentHeader, Dialog, DialogActions, Entity, Icon, Switch } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { useAlarmForm } from '@/composables'
import { ICON, $Alarm, $AlarmFormData } from '@/definitions'

defineProps<{ alarm?: $Alarm | $AlarmFormData }>()
defineOptions({ inheritAttrs: false })
const { t } = useI18n({ useScope: 'global' })
const { title, formData, hasData, hasChanges, reset, set, create, remove, update } = useAlarmForm()
</script>

<template>
  <Dialog.Root v-slot="{ close }" @update:open="$event && alarm ? set(alarm) : reset()">
    <Dialog.Trigger as-child>
      <slot>
        <button type="button" class="btn" v-bind="$attrs">
          <Icon v-if="alarm" icon="edit" />
          <Icon v-else icon="add" />
        </button>
      </slot>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay class="overlay" />
      <Dialog.Content class="dialog" as="form">
        <ContentHeader :icon="ICON">
          <template #title>
            <Dialog.Title class="headline grow">
              <span class="sr-only" v-text="title" />
              <label for="alarm-name" class="sr-only" v-text="t('entity.name')" />
              <input id="alarm-name" v-model="formData.name" class="input" type="text" :placeholder="t('entity.name')" />
            </Dialog.Title>
          </template>
          <template #description>
            <Dialog.Description class="paragraph description">{{ t('alarm.dialog.description', '') }}</Dialog.Description>
          </template>
          <template #row>
            <Entity.UuidBadge :entity="alarm" />
          </template>
        </ContentHeader>

        <div class="px-6 grid gap-4">
          <label class="label" for="alarm-notification">
            <span class="label-text">{{ t('entity.notification') }}</span>
            <Notification.Select id="alarm-notification" v-model="formData.notification" class="input w-full" />
          </label>

          <label class="label" for="alarm-contact-group">
            <span class="label-text">{{ t('entity.contactGroup') }}</span>
            <ContactGroup.Select id="alarm-contact-group" v-model="formData.group" class="w-full" />
          </label>

          <div class="flex gap-4 justify-around">
            <label class="label grid gap-1 justify-items-center" for="alarm-buzzer">
              <span class="label-text">{{ t('entity.buzzer') }}</span>
              <Switch.Root id="alarm-buzzer" v-model="formData.buzzer" class="btn switch">
                <Switch.Thumb class="thumb" />
              </Switch.Root>
            </label>

            <label class="label grid gap-1 justify-items-center" for="alarm-led">
              <span class="label-text">{{ t('entity.led') }}</span>
              <Switch.Root id="alarm-led" v-model="formData.led" class="btn switch">
                <Switch.Thumb class="thumb" />
              </Switch.Root>
            </label>
          </div>
        </div>

        <DialogActions
          class="px-6"
          :has-data="hasData"
          :has-changes="hasChanges"
          @cancel="reset()"
          @close="close"
          @create="create.submit().then(close)"
          @remove="remove.submit(close)"
          @update="update.submit()"
        />
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</template>
