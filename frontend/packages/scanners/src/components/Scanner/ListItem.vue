<script setup lang="ts">
import { useAuth } from '@evac/auth'
import { Badge } from '@evac/ui'
import type { $Scanner } from '@/definitions'
import Dialog from './Dialog.vue'

defineProps<{ scanner: $Scanner }>()
defineOptions({ inheritAttrs: false })
const auth = useAuth()
</script>

<template>
  <Dialog :scanner="scanner">
    <button type="button" class="grid grid-cols-subgrid not-first:border-t h-12 items-center px-6 gap-4" v-bind="$attrs">
      <strong class="value text-left">{{ scanner.name }}</strong>
      <template v-if="auth.isAdmin">
        <Badge>{{ scanner.uuid }}</Badge>
        <Badge>{{ scanner.mac }}</Badge>
      </template>
      <Badge>{{ scanner.ip }}</Badge>
    </button>
  </Dialog>
</template>
