<script setup lang="ts">
import { useNotification } from '@/composables'
import type { $Notification } from '@/definitions'

const props = defineProps<{ uuid: $Notification['uuid'] }>()

const { notification } = useNotification(() => props.uuid)
</script>

<template>
  <slot :notification="notification" />
</template>
