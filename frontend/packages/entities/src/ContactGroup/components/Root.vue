<script setup lang="ts">
import { useItem } from '../composables'
import type { Detail } from '../definitions'

const props = defineProps<{ uuid: Detail['uuid'] }>()
const { item } = useItem(() => props.uuid)
</script>

<template>
  <slot :item="item" />
</template>
