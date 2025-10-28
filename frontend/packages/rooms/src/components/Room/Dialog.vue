<script setup lang="ts">
import { Location } from '@evac/locations'
import { ContentHeader, Dialog, DialogActions, Icon } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { useRoomForm } from '@/composables'
import { ICON, $Room, $RoomFormData } from '@/definitions'

const props = defineProps<{ room?: $Room | $RoomFormData }>()
defineOptions({ inheritAttrs: false })
const { t } = useI18n({ useScope: 'global' })

const { title, formData, hasData, hasChanges, reset, create, remove, update } = useRoomForm(() => props.room)
</script>

<template>
  <Dialog.Root v-slot="{ close }">
    <Dialog.Trigger as-child>
      <slot>
        <button type="button" class="btn" v-bind="$attrs">
          <Icon v-if="room" icon="edit" />
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
            <Dialog.Description class="description">{{ t('room.dialog.description', '') }}</Dialog.Description>
          </template>
        </ContentHeader>

        <form class="px-6 grid gap-4">
          <label class="label" for="room-name">
            <span class="label-text">{{ t('entity.name') }}</span>
            <input id="room-name" v-model="formData.name" class="input w-full" type="text" />
          </label>

          <label class="label" for="room-location">
            <span class="label-text">{{ t('entity.location') }}</span>
            <Location.Select id="room-location" v-model="formData.location" class="input w-full" />
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
