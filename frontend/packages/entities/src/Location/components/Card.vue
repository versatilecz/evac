<script setup lang="ts">
import { Badge, useDebug } from '@evac/ui'
import type * as def from '../definitions'
import Dialog from './Dialog.vue'

defineProps<{ location: def.Detail }>()
defineOptions({ inheritAttrs: false })
const { enabled: debugEnabled } = useDebug()
</script>

<template>
  <Dialog class="row-start-1 col-start-2 place-self-center" :location="location">
    <button type="button" class="btn btn-surface min-h-24 grid gap-2 place-content-center" v-bind="$attrs">
      <strong class="value">{{ location.name }}</strong>
      <Badge v-if="debugEnabled">{{ location.uuid }}</Badge>
    </button>
  </Dialog>
</template>
