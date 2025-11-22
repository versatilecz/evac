<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { KindIdentifier } from '../definitions'
import { useKind } from '../composables'

const modelValue = defineModel<KindIdentifier | null>()
const { t } = useI18n({ useScope: 'global' })
const { options } = useKind()
const value = computed({
  get: () => modelValue.value ?? null,
  set: (value: KindIdentifier | null) => {
    modelValue.value = value ?? null
  },
})
</script>

<template>
  <select v-model="value" class="select">
    <option v-if="value === null" disabled value="" selected>{{ t('contact.kind.placeholder') }}</option>
    <template v-for="option of options" :key="option.value">
      <option :value="option.value">{{ option.label }}</option>
    </template>
  </select>
</template>
