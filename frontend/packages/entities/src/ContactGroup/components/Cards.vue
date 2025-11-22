<script setup lang="ts">
import type { Detail } from '../definitions'
import Card from './Card.vue'

defineProps<{
  contactGroups: Iterable<Detail>
}>()
</script>

<template>
  <div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] items-center list">
    <template v-for="contactGroup of contactGroups" :key="contactGroup.uuid">
      <slot name="item" :contact-group="contactGroup">
        <Card :contact-group="contactGroup" />
      </slot>
    </template>
    <slot />
  </div>
</template>
