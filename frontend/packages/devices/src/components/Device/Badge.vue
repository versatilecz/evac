<script setup lang="ts">
import { useAuth } from '@evac/auth'
import { Badge } from '@evac/ui'
import type { $Device } from '@/definitions'
import { useActivityOnDevice } from '@evac/activity'

const props = defineProps<{
  device: $Device
}>()

const { isDebug } = useAuth()
const { activity } = useActivityOnDevice(() => props.device.uuid)
</script>

<template>
  <Badge class="cursor-pointer">
    {{ device.name }}
    <template v-if="isDebug && activity"> ({{ activity.rssi }}) </template>
  </Badge>
</template>
