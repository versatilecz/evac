<script setup lang="ts">
import { Email } from '@evac/emails'
import { ContentHeader, Dialog, DialogActions, Icon, Switch } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { useAlarmForm } from '@/composables'
import { ICON, $Alarm, $AlarmFormData } from '@/definitions'

const props = defineProps<{ alarm?: $Alarm | $AlarmFormData }>()
defineOptions({ inheritAttrs: false })
const { t } = useI18n({ useScope: 'global' })
const { title, formData, hasData, hasChanges, reset, create, remove, update } = useAlarmForm(() => props.alarm)
</script>

<template>
  <Dialog.Root v-slot="{ close }">
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
      <Dialog.Content class="dialog">
        <ContentHeader>
          <template #title>
            <Icon class="size-8" :icon="ICON" />
            <Dialog.Title class="headline">{{ title }}</Dialog.Title>
          </template>
          <template #description>
            <Dialog.Description class="description">{{ t('alarm.dialog.description', '') }}</Dialog.Description>
          </template>
        </ContentHeader>

        <form class="px-6 grid gap-4">
          <label class="labe" for="alarm-name">
            <span class="label-text">{{ t('entity.name') }}</span>
            <input id="alarm-name" v-model="formData.name" class="input w-full" type="text" />
          </label>

          <label class="label" for="alarm-email">
            <span class="label-text">{{ t('entity.email') }}</span>
            <Email.Select id="alarm-email" v-model="formData.email" class="input w-full" />
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
        </form>

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
