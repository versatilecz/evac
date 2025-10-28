<script setup lang="ts">
import { useDevices } from '../composables'

defineProps<{
  location?: string
  room?: string
  unlocated?: boolean
}>()

const { list: devices } = useDevices()
</script>

<template>
  <slot :devices="devices" :count="devices.length" />
</template>
