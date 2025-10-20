<script setup lang="ts">
import { useDevices } from '../composables'

const props = defineProps<{
  location?: string
  room?: string
  unlocated?: boolean
}>()

const { list: devices } = useDevices({
  location: () => props.location,
  room: () => props.room,
  unlocated: () => props.unlocated,
})
</script>

<template>
  <slot :devices="devices" :count="devices.length" />
</template>
