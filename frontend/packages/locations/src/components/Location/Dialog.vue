<script setup lang="ts">
import { ContentHeader, Dialog, DialogActions, Icon } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { useLocationForm } from '@/composables'
import { $Location, $LocationFormData } from '@/definitions'

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
      <Dialog.Content class="dialog">
        <ContentHeader>
          <template #title>
            <Icon class="size-8" icon="location_on" />
            <Dialog.Title class="headline">{{ title }}</Dialog.Title>
          </template>
          <template #description>
            <Dialog.Description class="description">{{ t('location.dialog.description', '') }}</Dialog.Description>
          </template>
        </ContentHeader>

        <form class="px-6 grid gap-4">
          <label class="label" for="location-name">
            <span class="label-text">{{ t('entity.name') }}</span>
            <input id="location-name" v-model="formData.name" class="input w-full" type="text" />
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
