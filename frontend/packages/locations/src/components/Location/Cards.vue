<script setup lang="ts">
import type { $Location } from '@/definitions'
import Card from './Card.vue'

defineProps<{
  locations: Iterable<$Location>
}>()
</script>

<template>
  <div class="grid gap-4 grid-cols-[repeat(auto-fill,_minmax(18rem,_1fr))] items-center list">
    <template v-for="location of locations" :key="location.uuid">
      <Card :location="location" />
    </template>
    <slot />
  </div>
</template>
