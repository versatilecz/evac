<script setup lang="ts">
import type { $Backup } from '@/tools/backup'
import Card from './Card.vue'

defineProps<{
  backups: Iterable<$Backup>
}>()
</script>

<template>
  <div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(18rem,_1fr))] items-center list">
    <template v-for="backup of backups" :key="backup.uuid">
      <Card :backup="backup" />
    </template>
    <slot />
  </div>
</template>
