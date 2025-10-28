<script setup lang="ts">
import { useAlarm } from '@/composables'
import type { $Alarm } from '@/definitions'

const props = defineProps<{ uuid: $Alarm['uuid'] }>()

const { alarm } = useAlarm(() => props.uuid)
</script>

<template>
  <slot :alarm="alarm" />
</template>
