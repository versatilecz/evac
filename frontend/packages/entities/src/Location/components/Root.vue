<script setup lang="ts">
import { useDetail } from '../composables'
import type * as def from '../definitions'

const props = defineProps<{ uuid: def.Detail['uuid'] }>()

const { detail } = useDetail(() => props.uuid)
</script>

<template>
  <slot :detail="detail" />
</template>
