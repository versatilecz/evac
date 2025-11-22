<script setup lang="ts">
import { ContentHeader, Dialog, DialogActions, Entity, Icon } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import Picker from '@/Contact/components/Picker.vue'
import { useForm } from '../composables'
import * as def from '../definitions'
import { computed } from 'vue'

const props = defineProps<{ contactGroup?: def.FormData }>()
defineOptions({ inheritAttrs: false })
const { t } = useI18n({ useScope: 'global' })
const { title, formData, hasData, hasChanges, reset, create, remove, update } = useForm(() => props.contactGroup)
</script>

<template>
  <Dialog.Root v-slot="{ close }" @update:open="reset()">
    <Dialog.Trigger as-child>
      <slot>
        <button type="button" class="btn" v-bind="$attrs">
          <Icon v-if="contactGroup" icon="edit" />
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
              <label for="contact-name" class="sr-only" v-text="t('entity.name')" />
              <input id="contact-name" v-model="formData.name" class="input grow" type="text" :placeholder="t('entity.name')" />
            </Dialog.Title>
          </template>
          <template #description>
            <Dialog.Description class="paragraph description">{{ t('contact.dialog.description', '') }}</Dialog.Description>
          </template>
          <template #row>
            <Entity.UuidBadge class="grow" :entity="contactGroup" />
          </template>
        </ContentHeader>

        <div class="px-6 grid gap-4">
          <Picker v-model="formData.contacts" />
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
