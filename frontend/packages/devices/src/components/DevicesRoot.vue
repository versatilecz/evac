<script setup lang="ts">
import type { $SourceType } from '@/definitions'
import { useDevices } from '../composables'

const props = defineProps<{
  sourceType?: $SourceType
  location?: string
  room?: string
}>()

const { list: devices } = useDevices({
  sourceType: props.sourceType,
  location: () => props.location,
  room: () => props.room,
})
</script>

<template>
  <slot :devices="devices" :count="devices.length" />
</template>
