<script setup lang="ts">
import { useDevice } from '@/composables'
import type { $Device } from '@/definitions'

const props = defineProps<{ uuid: $Device['uuid'] }>()

const { device } = useDevice(() => props.uuid)
</script>

<template>
  <slot :device="device" />
</template>
