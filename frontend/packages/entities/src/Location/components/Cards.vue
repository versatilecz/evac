<script setup lang="ts">
import type * as def from '../definitions'
import Card from './Card.vue'

defineProps<{
  locations: Iterable<def.Detail>
}>()
</script>

<template>
  <div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] items-center list">
    <template v-for="location of locations" :key="location.uuid">
      <Card :location="location" />
    </template>
    <slot />
  </div>
</template>
