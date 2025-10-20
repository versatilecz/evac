<script setup lang="ts">
import { Badge, BooleanIcon, useListContext } from '@evac/ui'
import { Room } from '@evac/rooms'
import { formatDateTime } from '@evac/utils'
import { useI18n } from 'vue-i18n'
import type { $Scanner } from '@/definitions'
import Dialog from './Dialog.vue'

defineProps<{ scanner: $Scanner }>()
defineOptions({ inheritAttrs: false })
const { locale } = useI18n({ useScope: 'global' })
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
      <Badge v-if="visible.lastActivity">{{ formatDateTime(scanner.lastActivity, locale) }}</Badge>
      <BooleanIcon v-if="visible.buzzer" :value="scanner.buzzer" />
      <BooleanIcon v-if="visible.led" :value="scanner.led" />
      <BooleanIcon v-if="visible.scan" :value="scanner.scan" />
    </button>
  </Dialog>
</template>
