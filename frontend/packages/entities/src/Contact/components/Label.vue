<script setup lang="ts">
import * as def from '../definitions'
import KindBadge from './KindBadge.vue'

defineProps<{ contact: def.Detail }>()
</script>

<template>
  <span class="flex gap-2">
    <strong class="value">{{ contact.name }}</strong>
    <KindBadge :contact="contact" />
  </span>
</template>
