<script setup lang="ts">
import { Badge } from '@evac/ui'
import { useFormat } from '@evac/ui'

defineProps<{ battery: number | null | undefined }>()
const formatter = useFormat()
</script>

<template>
  <Badge
    v-if="typeof battery === 'number' && Number.isFinite(battery)"
    :class="{
      'badge-accent-orange': battery < 20 && battery !== 0,
      'badge-accent-red': battery === 0,
    }"
  >
    <slot name="label" />
    {{ formatter.percent.format(battery ?? 0) }}
  </Badge>
  <Badge v-else>
    <slot name="label" />
    -
  </Badge>
</template>
