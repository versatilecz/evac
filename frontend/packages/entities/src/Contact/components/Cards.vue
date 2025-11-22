<script setup lang="ts">
import type { Detail } from '../definitions'
import Card from './Card.vue'

defineProps<{
  contacts: Iterable<Detail>
}>()
</script>

<template>
  <div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] items-center list">
    <template v-for="contact of contacts" :key="contact.uuid">
      <slot name="item" :contact="contact">
        <Card :contact="contact" />
      </slot>
    </template>
    <slot />
  </div>
</template>
