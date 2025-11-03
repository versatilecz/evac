<script setup lang="ts">
import { useEvent } from '@/composables'
import type { $Event } from '@/definitions'

const props = defineProps<{ uuid: $Event['uuid'] }>()

const { event } = useEvent(() => props.uuid)
</script>

<template>
  <slot :event="event" />
</template>
