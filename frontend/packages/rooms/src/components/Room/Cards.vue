<script setup lang="ts">
import type { $Room } from '@/definitions'
import Card from './Card.vue'

defineProps<{
  rooms: Iterable<$Room>
}>()
</script>

<template>
  <div class="grid gap-4 grid-cols-[repeat(auto-fill,_minmax(18rem,_1fr))] items-center list">
    <template v-for="room of rooms" :key="room.uuid">
      <Card :room="room" />
    </template>
    <slot />
  </div>
</template>
