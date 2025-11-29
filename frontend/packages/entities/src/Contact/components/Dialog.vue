<script setup lang="ts">
import { Badge, ContentHeader, Dialog, DialogActions, Entity, Icon } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { useForm } from '../composables'
import * as def from '../definitions'
import { isEmailKind, isSmsKind } from '../misc'
import SelectKind from './SelectKind.vue'

defineProps<{ contact?: def.FormData }>()
defineOptions({ inheritAttrs: false })
const { t } = useI18n({ useScope: 'global' })
const { title, formData, hasData, hasChanges, reset, set, create, remove, update, kind } = useForm()
</script>

<template>
  <Dialog.Root v-slot="{ close }" @update:open="$event && contact ? set(contact) : reset()">
    <Dialog.Trigger as-child>
      <slot>
        <button type="button" class="btn" v-bind="$attrs">
          <Icon v-if="contact" icon="edit" />
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
              <div class="flex gap-2 items-center">
                <input id="contact-name" v-model="formData.name" class="input grow" type="text" :placeholder="t('entity.name')" />
                <Badge v-if="def.Detail.safeParse(contact).success">{{ kind }}</Badge>
              </div>
            </Dialog.Title>
          </template>
          <template #description>
            <Dialog.Description class="paragraph description">{{ t('contact.dialog.description', '') }}</Dialog.Description>
          </template>
          <template #row>
            <Entity.UuidBadge class="grow" :entity="contact" />
          </template>
        </ContentHeader>

        <div class="px-6 grid gap-4">
          <label v-if="!def.Detail.safeParse(contact).success" class="label" for="contact-kind">
            <span class="label-text">{{ t('contact.kind.label') }}</span>
            <SelectKind id="contact-kind" v-model="kind" class="input w-full" />
          </label>

          <template v-if="isEmailKind(formData)">
            <label class="label" for="contact-email">
              <span class="label-text">{{ t('contact.kind.email') }}</span>
              <input id="contact-email" v-model="formData.kind.email.email" type="email" class="input w-full" :placeholder="t('contact.kind.email')" />
            </label>
          </template>
          <template v-else-if="isSmsKind(formData)">
            <label class="label" for="contact-phone">
              <span class="label-text">{{ t('contact.kind.sms') }}</span>
              <input id="contact-phone" v-model="formData.kind.sms.number" type="tel" class="input w-full" :placeholder="t('contact.kind.sms')" />
            </label>
          </template>
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
