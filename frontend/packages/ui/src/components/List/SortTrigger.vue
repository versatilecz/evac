<script setup lang="ts">
import { SortDirection } from '@evac/shared'
import Icon from '../Icon.vue'
import { useListContext } from '@/composables'

defineProps<{
  sortKey: string
}>()

const { sort, sortBy } = useListContext(true)
</script>

<template>
  <button type="button" class="sort-trigger" @click="sortBy(sortKey)">
    <slot />
    <template v-if="sort.key === sortKey">
      <Icon class="size-4" :icon="sort.direction === SortDirection.enum.Ascending ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" />
    </template>
  </button>
</template>
