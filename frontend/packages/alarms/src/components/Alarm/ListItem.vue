<script setup lang="ts">
import { Badge, BooleanIcon, useListContext } from '@evac/ui'
import type { $Alarm } from '@/definitions'
import Dialog from './Dialog.vue'

defineProps<{ alarm: $Alarm }>()
defineOptions({ inheritAttrs: false })
const { visible } = useListContext(true)
</script>

<template>
  <Dialog :alarm="alarm">
    <button type="button" class="item grid grid-cols-subgrid not-first:border-t h-12 items-center px-6 gap-4" v-bind="$attrs">
      <strong v-if="visible.name" class="value text-left">{{ alarm.name }}</strong>
      <Badge v-if="visible.uuid">{{ alarm.uuid }}</Badge>
      <span v-if="visible.subject" class="value text-left font-normal">{{ alarm.subject }}</span>
      <span v-if="visible.text" class="value text-left font-normal">{{ alarm.text }}</span>
      <BooleanIcon v-if="visible.buzzer" class="justify-self-center" :value="alarm.buzzer" />
      <BooleanIcon v-if="visible.led" class="justify-self-center" :value="alarm.led" />
    </button>
  </Dialog>
</template>
