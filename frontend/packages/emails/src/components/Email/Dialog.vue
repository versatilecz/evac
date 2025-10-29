<script setup lang="ts">
import { ContentHeader, Dialog, DialogActions, Icon } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { useEmailForm } from '@/composables'
import { $Email, $EmailFormData } from '@/definitions'

const props = defineProps<{ email?: $Email | $EmailFormData }>()
defineOptions({ inheritAttrs: false })
const { t } = useI18n({ useScope: 'global' })
const { title, formData, hasData, hasChanges, reset, create, remove, update } = useEmailForm(() => props.email)
</script>

<template>
  <Dialog.Root v-slot="{ close }">
    <Dialog.Trigger as-child>
      <slot>
        <button type="button" class="btn" v-bind="$attrs">
          <Icon v-if="email" icon="edit" />
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
            <Dialog.Description class="description">{{ t('email.dialog.description', '') }}</Dialog.Description>
          </template>
        </ContentHeader>

        <form class="px-6 grid gap-4">
          <label class="labe" for="email-name">
            <span class="label-text">{{ t('entity.name') }}</span>
            <input id="email-name" v-model="formData.name" class="input w-full" type="text" />
          </label>
          <label class="label" for="email-subject">
            <span class="label-text">{{ t('entity.subject') }}</span>
            <input id="email-subject" v-model="formData.subject" class="input w-full" type="text" />
          </label>
          <label class="label" for="email-text">
            <span class="label-text">{{ t('entity.text') }}</span>
            <textarea id="email-text" v-model="formData.text" class="input w-full" type="text" />
          </label>
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
