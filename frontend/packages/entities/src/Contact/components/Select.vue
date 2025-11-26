<script setup lang="ts">
import { SimpleSelect } from '@evac/ui'
import * as def from '../definitions'
import { useState } from '../composables'
import Label from './Label.vue'

const modelValue = defineModel<def.Detail['uuid'] | null | undefined>()
const { state, list: options } = useState()
</script>

<template>
  <SimpleSelect v-model="modelValue" :state="state" :options="options">
    <template #option="{ option }">
      <Label :contact="option" />
    </template>
  </SimpleSelect>
</template>
