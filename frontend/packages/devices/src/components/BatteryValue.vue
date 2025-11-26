<script setup lang="ts">
import { useFormat } from '@evac/ui'

defineProps<{ battery: number | null | undefined }>()
const formatter = useFormat()
</script>

<template>
  <span
    v-if="typeof battery === 'number' && Number.isFinite(battery)"
    class="text-right"
    :class="{
      'text-accent-orange': battery < 20 && battery !== 0,
      'text-accent-red': !battery,
    }"
  >
    {{ formatter.percent.format(battery / 100) }}
  </span>
  <span v-else class="text-center text-muted"> - </span>
</template>
