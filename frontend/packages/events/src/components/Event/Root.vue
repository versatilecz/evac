<script setup lang="ts">
import { useEvent } from '@/composables'
import type { $Event } from '@/definitions'

const props = defineProps<{ uuid: $Event['uuid'] }>()

const { event, device, scanner, room, location, kindLabel, remove } = useEvent(() => props.uuid)
</script>

<template>
  <slot :event="event" :device="device" :scanner="scanner" :room="room" :location="location" :kind-label="kindLabel" :remove="remove" />
</template>
