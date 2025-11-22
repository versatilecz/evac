<script setup lang="ts">
import { Badge } from '@evac/ui'
import { useKind } from '../composables'
import * as def from '../definitions'

const props = defineProps<{ contact: def.Detail }>()
const { kind } = useKind(() => props.contact)
</script>

<template>
  <Badge v-if="kind">{{ kind }}</Badge>
</template>
