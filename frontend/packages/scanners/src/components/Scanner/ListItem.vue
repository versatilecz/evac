<script setup lang="ts">
import { Badge, BooleanIcon, useFormat, useListContext } from '@evac/ui'
import { Room } from '@evac/rooms'
import type { $Scanner } from '@/definitions'
import Dialog from './Dialog.vue'

defineProps<{ scanner: $Scanner }>()
defineOptions({ inheritAttrs: false })
const formatter = useFormat()
const { visible } = useListContext(true)
</script>

<template>
  <Dialog :scanner="scanner">
    <button type="button" class="item grid grid-cols-subgrid not-first:border-t h-12 items-center px-6 gap-4" v-bind="$attrs">
      <strong v-if="visible.name" class="value text-left">{{ scanner.name }}</strong>
      <Room.Root v-if="visible.room" v-slot="{ room }" :uuid="scanner.room">
        <span v-if="visible.room" class="value text-left">{{ room.name }}</span>
      </Room.Root>
      <Badge v-if="visible.uuid">{{ scanner.uuid }}</Badge>
      <Badge v-if="visible.mac">{{ scanner.mac }}</Badge>
      <Badge v-if="visible.ip">{{ scanner.ip }}{{ scanner.port ? `:${scanner.port}` : '' }}</Badge>
      <Badge v-if="visible.lastActivity">{{ formatter.dateTime.format(scanner.lastActivity) }}</Badge>
      <BooleanIcon v-if="visible.buzzer" class="justify-self-center" :value="scanner.buzzer" />
      <BooleanIcon v-if="visible.led" class="justify-self-center" :value="scanner.led" />
      <BooleanIcon v-if="visible.scan" class="justify-self-center" :value="scanner.scan" />
    </button>
  </Dialog>
</template>
