<script setup lang="ts">
import { useActiveAlarm } from '@/composables'

const { data } = useActiveAlarm()
</script>

<template>
  <slot :active-alarm="data" :is-alarm="!!data" />
</template>
