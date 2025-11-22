<script setup lang="ts">
import { useItem } from '../composables'
import type * as def from '../definitions'

const props = defineProps<{ uuid: def.Detail['uuid'] }>()

const { item: notification } = useItem(() => props.uuid)
</script>

<template>
  <slot :notification="notification" />
</template>
