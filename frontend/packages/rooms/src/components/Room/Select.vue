<script setup lang="ts">
import { $SortDirection } from '@evac/shared'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRooms } from '@/composables'
import { $Room } from '@/definitions'

const modelValue = defineModel<$Room['uuid']>()
const { t } = useI18n({ useScope: 'global' })
const { list } = useRooms({ sort: [{ key: 'name', direction: $SortDirection.enum.Ascending }] })
const value = computed({
  get: () => modelValue.value || null,
  set: (value: $Room['uuid'] | undefined) => {
    modelValue.value = value || undefined
  },
})
</script>

<template>
  <select v-model="value" class="select w-full">
    <option disabled value="">{{ t('room.select.placeholder') }}</option>
    <template v-for="room of list" :key="room.uuid">
      <option :value="room.uuid">{{ room.name }}</option>
    </template>
  </select>
</template>
