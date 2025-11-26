<script setup lang="ts">
import { Badge, useDebug } from '@evac/ui'
import type { $Device } from '@/definitions'
import { useActivityOnDevice } from '@evac/activity'

const props = defineProps<{
  device: $Device
}>()

const { enabled: debugEnabled } = useDebug()
const { activity } = useActivityOnDevice(() => props.device.uuid)
</script>

<template>
  <Badge class="cursor-pointer">
    {{ device.name }}
    <template v-if="debugEnabled && activity"> ({{ activity.rssi }}) </template>
  </Badge>
</template>
