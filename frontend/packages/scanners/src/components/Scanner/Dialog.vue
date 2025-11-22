<script setup lang="ts">
import { Room } from '@evac/rooms'
import { Badge, ContentHeader, Dialog, DialogActions, Entity, Icon, Switch, useFormat } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { useScannerForm } from '@/composables'
import { ICON, $Scanner } from '@/definitions'

const props = defineProps<{ scanner: $Scanner }>()
defineOptions({ inheritAttrs: false })
const { t } = useI18n({ useScope: 'global' })
const formatter = useFormat()
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
      <Dialog.Content class="dialog" as="form">
        <input v-if="hasData" type="text" autofocus tabindex="0" class="sr-only" :aria-label="title" />
        <ContentHeader :icon="ICON">
          <template #title>
            <Dialog.Title class="headline grow">
              <span class="sr-only" v-text="title" />
              <label for="scanner-name" class="sr-only" v-text="t('entity.name')" />
              <input id="scanner-name" v-model="formData.name" class="input" type="text" :placeholder="t('entity.name')" />
            </Dialog.Title>
          </template>
          <template #description>
            <Dialog.Description class="paragraph description">{{ t('scanner.dialog.description', '') }}</Dialog.Description>
          </template>
          <template #row>
            <Entity.UuidBadge :entity="scanner" />
          </template>
        </ContentHeader>

        <div class="px-6 grid gap-4">
          <label class="label" for="scanner-room">
            <span class="label-text">{{ t('entity.room') }}</span>
            <Room.Select id="scanner-room" v-model="formData.room" class="input w-full" />
          </label>

          <div class="flex gap-4 justify-between">
            <Badge>{{ t('entity.mac') }} {{ formData.mac }}</Badge>
            <Badge>{{ t('entity.ip') }} {{ formData.ip }}{{ formData.port ? `:${formData.port}` : '' }}</Badge>
            <Badge>{{ t('entity.activity') }} {{ formatter.dateTime.format(formData.lastActivity) }}</Badge>
          </div>

          <div class="flex gap-4 justify-around">
            <label class="label grid gap-1 justify-items-center" for="scanner-buzzer">
              <span class="label-text">{{ t('entity.buzzer') }}</span>
              <Switch.Root id="scanner-buzzer" v-model="formData.buzzer" class="btn switch">
                <Switch.Thumb class="thumb" />
              </Switch.Root>
            </label>

            <label class="label grid gap-1 justify-items-center" for="scanner-led">
              <span class="label-text">{{ t('entity.led') }}</span>
              <Switch.Root id="scanner-led" v-model="formData.led" class="btn switch">
                <Switch.Thumb class="thumb" />
              </Switch.Root>
            </label>

            <label class="label grid gap-1 justify-items-center" for="scanner-scan">
              <span class="label-text">{{ t('entity.scan') }}</span>
              <Switch.Root id="scanner-scan" v-model="formData.scan" class="btn switch">
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
