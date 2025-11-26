<script setup lang="ts">
import { Badge, Entity, Icon } from '@evac/ui'
import { Notification } from '@evac/entities'
import { useI18n } from 'vue-i18n'
import type { AlarmInfo } from '@/definitions'
import { useAlarm } from '@/composables'

const props = defineProps<{ alarmInfo: AlarmInfo }>()
const { t } = useI18n()
const { alarm } = useAlarm(() => props.alarmInfo.alarm)
const { item: notification } = Notification.useItem(() => alarm.value?.notification)
</script>

<template>
  <section class="p-4 shadow-md rounded-lg border-2 border-accent-red bg-accent-red/10 grid gap-3">
    <header class="flex gap-4 items-center">
      <Icon class="size-8 fill-accent-red" icon="warning" />
      <h1 class="headline" v-text="t('alarm.title')" />
      <span class="grow" />
      <slot name="actions" />
    </header>
    <Badge v-if="alarmInfo.location">
      <Entity.Breadcrumbs v-slot="{ delimiter, rest, last }" :location="alarmInfo.location" :room="alarmInfo.room" :scanner="alarmInfo.scanner" :device="alarmInfo.device">
        <template v-if="rest.length">{{ rest + delimiter }}</template
        ><strong>{{ last }}</strong>
      </Entity.Breadcrumbs>
    </Badge>

    <template v-if="notification">
      <h2 class="font-bold text-lg" v-text="notification.subject" />
      <div>{{ notification.long }}</div>
    </template>

    <slot />
  </section>
</template>
