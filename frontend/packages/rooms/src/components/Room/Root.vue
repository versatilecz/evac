<script setup lang="ts">
import { useRoom } from '@/composables'
import type { $Room } from '@/definitions'

const props = defineProps<{ uuid: $Room['uuid'] }>()
const { room } = useRoom(() => props.uuid)
</script>

<template>
  <slot :room="room" />
</template>
