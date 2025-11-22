<script setup lang="ts">
import { ContentHeader, Dialog, DialogActions, Entity, Icon } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { useLocationForm } from '@/composables'
import { ICON, $Location, $LocationFormData } from '@/definitions'

const props = defineProps<{ location?: $Location | $LocationFormData }>()
defineOptions({ inheritAttrs: false })
const { t } = useI18n({ useScope: 'global' })
const { title, formData, hasData, hasChanges, reset, create, remove, update } = useLocationForm(() => props.location)
</script>

<template>
  <Dialog.Root v-slot="{ close }">
    <Dialog.Trigger as-child>
      <slot>
        <button type="button" class="btn" v-bind="$attrs">
          <Icon v-if="location" icon="edit" />
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
              <label for="location-name" class="sr-only" v-text="t('entity.name')" />
              <input id="location-name" v-model="formData.name" class="input" type="text" :placeholder="t('entity.name')" />
            </Dialog.Title>
          </template>
          <template #description>
            <Dialog.Description class="paragraph description">{{ t('location.dialog.description', '') }}</Dialog.Description>
          </template>
          <template #row>
            <Entity.UuidBadge :entity="location" />
          </template>
        </ContentHeader>

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
