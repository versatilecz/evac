<script setup lang="ts">
import { useLocation } from '@/composables'
import type { $Location } from '@/definitions'

const props = defineProps<{ uuid: $Location['uuid'] }>()

const { location } = useLocation(() => props.uuid)
</script>

<template>
  <slot :location="location" />
</template>
