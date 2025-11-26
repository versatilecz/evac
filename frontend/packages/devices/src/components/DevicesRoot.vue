<script setup lang="ts">
import type { $SourceType } from '@/definitions'
import { useDevices } from '../composables'

const props = defineProps<{
  sourceType?: $SourceType
  location?: string
  room?: string
  enabledOnly?: boolean
}>()

const { list: devices } = useDevices({
  sourceType: props.sourceType,
  location: () => props.location,
  room: () => props.room,
  filter: {
    enabledOnly: props.enabledOnly ? true : undefined,
  },
})
</script>

<template>
  <slot :devices="devices" :count="devices.length" />
</template>
