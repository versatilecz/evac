<script setup lang="ts">
import { Badge, BooleanIcon, useFormat, useListContext } from '@evac/ui'
import type { $Device } from '@/definitions'
import Dialog from './Dialog.vue'
import BatteryValue from '../BatteryValue.vue'

defineProps<{ device: $Device }>()
defineOptions({ inheritAttrs: false })
const formatter = useFormat()
const { visible } = useListContext(true)
</script>

<template>
  <Dialog :device="device">
    <button type="button" class="item grid grid-cols-subgrid not-first:border-t h-12 items-center px-6 gap-4" v-bind="$attrs">
      <strong v-if="visible.name" class="value text-left">{{ device.name }}</strong>
      <Badge v-if="visible.uuid">{{ device.uuid }}</Badge>
      <Badge v-if="visible.mac">{{ device.mac }}</Badge>
      <BatteryValue v-if="visible.battery" class="value" :battery="device.battery" />
      <Badge v-if="visible.lastActivity">{{ formatter.dateTime.format(device.lastActivity) }}</Badge>
      <BooleanIcon v-if="visible.enabled" class="justify-self-center" :value="device.enabled" />
    </button>
  </Dialog>
</template>
