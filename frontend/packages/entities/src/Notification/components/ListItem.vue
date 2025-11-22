<script setup lang="ts">
import { Badge, useListContext } from '@evac/ui'
import type * as def from '../definitions'
import Dialog from './Dialog.vue'

defineProps<{ notification: def.Detail }>()
defineOptions({ inheritAttrs: false })
const { visible } = useListContext(true)
</script>

<template>
  <Dialog :notification="notification">
    <button type="button" class="item grid grid-cols-subgrid not-first:border-t h-12 items-center px-6 gap-4" v-bind="$attrs">
      <strong v-if="visible.name" class="value text-left">{{ notification.name }}</strong>
      <Badge v-if="visible.uuid">{{ notification.uuid }}</Badge>
      <span v-if="visible.subject" class="value text-left font-normal">{{ notification.subject }}</span>
      <span v-if="visible.short" class="value text-left font-normal">{{ notification.short }}</span>
      <span v-if="visible.long" class="value text-left font-normal">{{ notification.long }}</span>
    </button>
  </Dialog>
</template>
