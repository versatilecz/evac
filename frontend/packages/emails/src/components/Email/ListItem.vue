<script setup lang="ts">
import { Badge, useListContext } from '@evac/ui'
import type { $Email } from '@/definitions'
import Dialog from './Dialog.vue'

defineProps<{ email: $Email }>()
defineOptions({ inheritAttrs: false })
const { visible } = useListContext(true)
</script>

<template>
  <Dialog :email="email">
    <button type="button" class="item grid grid-cols-subgrid not-first:border-t h-12 items-center px-6 gap-4" v-bind="$attrs">
      <strong v-if="visible.name" class="value text-left">{{ email.name }}</strong>
      <Badge v-if="visible.uuid">{{ email.uuid }}</Badge>
      <span v-if="visible.subject" class="value text-left font-normal">{{ email.subject }}</span>
      <span v-if="visible.text" class="value text-left font-normal">{{ email.text }}</span>
    </button>
  </Dialog>
</template>
