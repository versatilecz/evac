<script setup lang="ts">
import { Badge, BooleanIcon, Icon } from '@evac/ui'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { $ActiveAlarm } from '@/definitions'

const props = defineProps<{ alarm: $ActiveAlarm }>()
const { t } = useI18n()

const placement = computed(() => {
  const alarm = props.alarm
  let parts = []
  if (alarm.location) parts.push(alarm.location)
  if (alarm.room) parts.push(alarm.room)
  if (alarm.scanner) parts.push(alarm.scanner)
  return parts.join(' / ')
})
</script>

<template>
  <section class="p-4 shadow-md rounded-lg border-2 border-accent-red bg-accent-red/10 grid gap-4">
    <header class="flex gap-4 items-center">
      <Icon class="size-8 fill-accent-red" icon="warning" />
      <h2 class="headline" v-text="alarm.subject" />

      <span class="grow" />
      <Badge v-if="alarm.location"
        >{{ placement }} / <strong>{{ alarm.device }}</strong></Badge
      >
      <Badge>{{ t('entity.led') }}: <BooleanIcon :value="alarm.led" /></Badge>
      <Badge>{{ t('entity.buzzer') }}: <BooleanIcon :value="alarm.buzzer" /></Badge>
    </header>

    <p v-if="alarm.text" v-text="alarm.text" />
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-else-if="alarm.html" v-html="alarm.html" />

    <slot />
  </section>
</template>
