<script setup lang="ts">
import { Location } from '@evac/entities'
import { ContentHeader, Dialog, DialogActions, Entity, Icon } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { useRoomForm } from '@/composables'
import { ICON, $Room, $RoomFormData } from '@/definitions'

defineProps<{ room?: $Room | $RoomFormData }>()
defineOptions({ inheritAttrs: false })
const { t } = useI18n({ useScope: 'global' })
const { title, formData, hasData, hasChanges, reset, set, create, remove, update } = useRoomForm()
</script>

<template>
  <Dialog.Root v-slot="{ close }" @update:open="$event && room ? set(room) : reset()">
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
      <Dialog.Content class="dialog" as="form">
        <input v-if="hasData" type="text" autofocus tabindex="0" class="sr-only" :aria-label="title" />
        <ContentHeader :icon="ICON">
          <template #title>
            <Dialog.Title class="headline grow">
              <span class="sr-only" v-text="title" />
              <label for="room-name" class="sr-only" v-text="t('entity.name')" />
              <input id="room-name" v-model="formData.name" class="input" type="text" :placeholder="t('entity.name')" />
            </Dialog.Title>
          </template>
          <template #description>
            <Dialog.Description class="paragraph description">{{ t('room.dialog.description', '') }}</Dialog.Description>
          </template>
          <template #row>
            <Entity.UuidBadge :entity="room" />
          </template>
        </ContentHeader>

        <div class="px-6 grid gap-4">
          <label class="label" for="room-location">
            <span class="label-text">{{ t('entity.location') }}</span>
            <Location.Select id="room-location" v-model="formData.location" class="input w-full" />
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
