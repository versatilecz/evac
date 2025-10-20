<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Icon from './Icon.vue'

defineProps<{
  hasData?: boolean
  hasChanges?: boolean
}>()
defineEmits<{
  close: [event: Event]
  cancel: [event: Event]
  create: [event: Event]
  remove: [event: Event]
  update: [event: Event]
}>()
const { t } = useI18n({ useScope: 'global' })
</script>

<template>
  <div class="flex gap-4 justify-end py-6">
    <template v-if="hasData && hasChanges">
      <button class="btn" type="button" @click="$emit('cancel', $event)">
        <Icon icon="undo" />
        {{ t('action.cancelChanges') }}
      </button>
      <button class="btn btn-filled" type="button" @click="$emit('update', $event)">
        <Icon icon="check" />
        {{ t('action.save') }}
      </button>
    </template>
    <template v-else-if="hasData">
      <button class="btn text-accent-red" type="button" @click="$emit('remove', $event)">
        <Icon icon="delete" />
        {{ t('action.delete') }}
      </button>
      <span class="grow" />
      <button class="btn" type="button" @click="$emit('close', $event)">
        <Icon icon="close" />
        {{ t('action.close') }}
      </button>
    </template>
    <template v-else>
      <button class="btn" type="button" @click="$emit('close', $event)">
        <Icon icon="close" />
        {{ t('action.close') }}
      </button>
      <button class="btn btn-filled" type="button" @click="$emit('create', $event)">
        <Icon icon="add" />
        {{ t('action.create') }}
      </button>
    </template>
  </div>
</template>
