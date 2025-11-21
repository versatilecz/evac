<script setup lang="ts">
import { $SortDirection } from '@evac/shared'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEmails } from '@/composables'
import { $Email } from '@/definitions'

const modelValue = defineModel<$Email['uuid']>()
const { t } = useI18n({ useScope: 'global' })
const { list } = useEmails({ sort: [{ key: 'name', direction: $SortDirection.enum.Ascending }] })
const value = computed({
  get: () => modelValue.value || null,
  set: (value: $Email['uuid'] | undefined) => {
    modelValue.value = value || undefined
  },
})
</script>

<template>
  <select v-model="value" class="select w-full">
    <option disabled value="">{{ t('email.select.placeholder') }}</option>
    <template v-for="item of list" :key="item.uuid">
      <option :value="item.uuid">{{ item.name }}</option>
    </template>
  </select>
</template>
