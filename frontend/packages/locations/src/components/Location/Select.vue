<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocations, sortBy } from '@/composables'
import { $Location } from '@/definitions'

const modelValue = defineModel<$Location['uuid']>()
const { t } = useI18n({ useScope: 'global' })
const { data } = useLocations()
const value = computed({
  get: () => modelValue.value || null,
  set: (value: $Location['uuid'] | undefined) => {
    modelValue.value = value || undefined
  },
})
</script>

<template>
  <select v-model="value" class="select w-full">
    <option disabled value="">{{ t('location.select.placeholder') }}</option>
    <template v-for="location of sortBy(data.values(), 'name')" :key="location.uuid">
      <option :value="location.uuid">{{ location.name }}</option>
    </template>
  </select>
</template>
