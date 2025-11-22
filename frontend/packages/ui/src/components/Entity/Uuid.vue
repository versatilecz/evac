<script setup lang="ts">
import { useEntityUuid } from '@/composables'

const props = defineProps<{ entity: unknown }>()
const { uuid, hasUuid } = useEntityUuid(() => props.entity)
</script>

<template>
  <template v-if="hasUuid">
    <slot :uuid="uuid" />
  </template>
</template>
