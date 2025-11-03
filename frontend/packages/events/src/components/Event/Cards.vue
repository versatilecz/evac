<script setup lang="ts">
import type { $Event } from '@/definitions'
import Card from './Card.vue'

defineProps<{
  events: Iterable<$Event>
}>()
</script>

<template>
  <div class="list">
    <template v-for="event of events" :key="event.uuid">
      <Card :event="event" />
    </template>
    <slot />
  </div>
</template>
