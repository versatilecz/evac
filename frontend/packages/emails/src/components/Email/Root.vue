<script setup lang="ts">
import { useEmail } from '@/composables'
import type { $Email } from '@/definitions'

const props = defineProps<{ uuid: $Email['uuid'] }>()

const { email } = useEmail(() => props.uuid)
</script>

<template>
  <slot :email="email" />
</template>
