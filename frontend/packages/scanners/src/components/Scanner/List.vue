<script setup lang="ts">
import { useAuth } from '@evac/auth'
import type { $Scanner } from '@/definitions'
import ListItem from './ListItem.vue'
import { computed } from 'vue'

defineProps<{
  scanners: Iterable<$Scanner>
}>()
defineEmits<{
  (e: 'update:sort', key: keyof $Scanner): void
}>()
const auth = useAuth()
const cols = computed(() => {
  return auth.isAdmin
    ? {
        container: 'grid-cols-[1fr_max-content_max-content_max-content_max-content]',
        item: 'col-span-6',
      }
    : {
        container: 'grid-cols-[1fr_max-content_max-content]',
        item: 'col-span-4',
      }
})
</script>

<template>
  <section class="list grid content-start" :class="cols.container">
    <header class="grid grid-cols-subgrid headline gap-4 border-b px-6 py-3" :class="cols.item">
      <button type="button" class="text-left" @click="$emit('update:sort', 'name')">Name</button>
      <template v-if="auth.isAdmin">
        <button type="button" class="text-center" @click="$emit('update:sort', 'uuid')">UUID</button>
        <button type="button" class="text-center" @click="$emit('update:sort', 'mac')">MAC</button>
      </template>
      <button type="button" class="text-center" @click="$emit('update:sort', 'ip')">IP</button>
      <button type="button" class="text-right" @click="$emit('update:sort', 'lastActivity')">Activity</button>
    </header>
    <template v-for="scanner of scanners" :key="scanner.uuid">
      <ListItem :class="cols.item" :scanner="scanner" />
    </template>
    <slot />
  </section>
</template>
