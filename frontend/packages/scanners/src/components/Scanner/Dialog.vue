<script setup lang="ts">
import { ContentHeader, Dialog, DialogActions, Icon } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { useScannerForm } from '@/composables'
import { $Scanner } from '@/definitions'

const props = defineProps<{ scanner: $Scanner }>()
defineOptions({ inheritAttrs: false })
const { t } = useI18n({ useScope: 'global' })

const { title, formData, hasData, hasChanges, reset, remove, update } = useScannerForm(() => props.scanner)
</script>

<template>
  <Dialog.Root v-slot="{ close }">
    <Dialog.Trigger as-child>
      <slot>
        <button type="button" class="btn" v-bind="$attrs">
          <Icon v-if="scanner" icon="edit" />
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
            <Dialog.Description class="description">{{ t('scanner.dialog.description', '') }}</Dialog.Description>
          </template>
        </ContentHeader>

        <form class="px-6">
          <label class="label" for="location-name">
            <span class="label-text">{{ t('entity.name') }}</span>
            <input id="location-name" v-model="formData.name" class="input w-full" type="text" />
          </label>

          <pre><code>{{ formData }}</code></pre>

          <DialogActions :has-data="hasData" :has-changes="hasChanges" @cancel="reset()" @close="close" @remove="remove.submit(close)" @update="update.submit()" />
        </form>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</template>
