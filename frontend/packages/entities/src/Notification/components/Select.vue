<script setup lang="ts">
import { SortDirection } from '@evac/shared'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useState } from '../composables'
import type * as def from '../definitions'

const modelValue = defineModel<def.Detail['uuid']>()
const { t } = useI18n({ useScope: 'global' })
const { list } = useState({ sort: [{ key: 'name', direction: SortDirection.enum.Ascending }] })
const value = computed({
  get: () => modelValue.value || null,
  set: (value: def.Detail['uuid'] | undefined) => {
    modelValue.value = value || undefined
  },
})
</script>

<template>
  <select v-model="value" class="select w-full">
    <option disabled value="">{{ t('notification.select.placeholder') }}</option>
    <template v-for="item of list" :key="item.uuid">
      <option :value="item.uuid">{{ item.name }}</option>
    </template>
  </select>
</template>
