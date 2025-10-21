<script setup lang="ts">
import { useAuth } from '@evac/auth'
import type { $Scanner } from '@/definitions'
import ListItem from './ListItem.vue'

defineProps<{
  scanners: Iterable<$Scanner>
}>()
defineEmits<{
  (e: 'update:sort', key: keyof $Scanner): void
}>()
const auth = useAuth()
</script>

<template>
  <section class="list grid grid-cols-[1fr_max-content_max-content_max-content] content-start">
    <header class="grid grid-cols-subgrid col-span-4 headline gap-4 border-b px-6 py-3">
      <button type="button" class="text-left" @click="$emit('update:sort', 'name')">Name</button>
      <template v-if="auth.isAdmin">
        <button type="button" class="text-center" @click="$emit('update:sort', 'uuid')">UUID</button>
        <button type="button" class="text-center" @click="$emit('update:sort', 'mac')">MAC</button>
      </template>
      <button type="button" class="text-center" @click="$emit('update:sort', 'ip')">IP</button>
    </header>
    <template v-for="scanner of scanners" :key="scanner.uuid">
      <ListItem class="col-span-4" :scanner="scanner" />
    </template>
    <slot />
  </section>
</template>
