<script setup lang="ts">
import { ContentHeader, Dialog, DialogActions, Entity, Icon } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { useForm } from '../composables'
import * as def from '../definitions'

const props = defineProps<{ notification?: def.FormData }>()
defineOptions({ inheritAttrs: false })
const { t } = useI18n({ useScope: 'global' })
const { title, formData, hasData, hasChanges, reset, create, remove, update } = useForm(() => props.notification)
</script>

<template>
  <Dialog.Root v-slot="{ close }">
    <Dialog.Trigger as-child>
      <slot>
        <button type="button" class="btn" v-bind="$attrs">
          <Icon v-if="notification" icon="edit" />
          <Icon v-else icon="add" />
        </button>
      </slot>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay class="overlay" />
      <Dialog.Content class="dialog" as="form">
        <input v-if="hasData" type="text" autofocus tabindex="0" class="sr-only" :aria-label="title" />
        <ContentHeader :icon="def.ICON">
          <template #title>
            <Dialog.Title class="headline grow">
              <span class="sr-only" v-text="title" />
              <label for="notification-name" class="sr-only" v-text="t('entity.name')" />
              <input id="notification-name" v-model="formData.name" class="input" type="text" :placeholder="t('entity.name')" />
            </Dialog.Title>
          </template>
          <template #description>
            <Dialog.Description class="paragraph description">{{ t('notification.dialog.description', '') }}</Dialog.Description>
          </template>
          <template #row>
            <Entity.UuidBadge :entity="notification" />
          </template>
        </ContentHeader>

        <div class="px-6 grid gap-4">
          <label class="label" for="notification-subject">
            <span class="label-text">{{ t('entity.subject') }}</span>
            <input id="notification-subject" v-model="formData.subject" class="input w-full" type="text" />
          </label>
          <label class="label" for="notification-short-text">
            <span class="label-text">{{ t('entity.shortText') }}</span>
            <textarea id="notification-short-text" v-model="formData.short" rows="5" class="input w-full" type="text" />
          </label>
          <label class="label" for="notification-long-text">
            <span class="label-text">{{ t('entity.longText') }}</span>
            <textarea id="notification-long-text" v-model="formData.long" rows="5" class="input w-full" type="text" />
          </label>
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
