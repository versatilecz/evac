<script setup lang="ts">
import { Badge, useDebug } from '@evac/ui'
import type { Detail } from '../definitions'

defineProps<{ contactGroup: Detail }>()
defineOptions({ inheritAttrs: false })
const { enabled: debugEnabled } = useDebug()
</script>

<template>
  <button type="button" class="btn btn-surface grid gap-0 py-3 h-auto justify-start justify-items-start content-center" v-bind="$attrs">
    <span class="flex gap-2">
      <span class="value" v-text="contactGroup.name" />
      <Badge>{{ contactGroup.contacts.size }}</Badge>
    </span>
    <Badge v-if="debugEnabled">{{ contactGroup.uuid }}</Badge>
  </button>
</template>
