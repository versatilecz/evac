<script setup lang="ts">
import { useScanner } from '@/composables'
import type { $Scanner } from '@/definitions'

const props = defineProps<{ uuid: $Scanner['uuid'] }>()

const { scanner } = useScanner(() => props.uuid)
</script>

<template>
  <slot :scanner="scanner" />
</template>
