<script setup lang="ts">
import { SortDirection } from '@evac/shared'
import { SimpleSelect } from '@evac/ui'
import { useState } from '../composables'
import type * as def from '../definitions'

const modelValue = defineModel<def.Detail['uuid'] | null | undefined>()
const { state, list: options } = useState({ sort: [{ key: 'name', direction: SortDirection.enum.Ascending }] })
</script>

<template>
  <SimpleSelect v-model="modelValue" :state="state" :options="options" />
</template>
