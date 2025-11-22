<script setup lang="ts">
import type { $Event } from '@/definitions'
import Card from './Card.vue'

defineProps<{
  events: Iterable<$Event>
}>()
</script>

<template>
  <div class="list">
    <template v-for="(event, index) of events" :key="event.uuid">
      <slot name="event" :event="event" :index="index">
        <Card :event="event" />
      </slot>
    </template>
    <slot />
  </div>
</template>
