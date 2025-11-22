<script setup lang="ts">
import { Badge, BooleanIcon, Entity, Icon } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import type { $ActiveAlarm } from '@/definitions'
import { useNotification } from '@evac/notifications'

const props = defineProps<{ alarm: $ActiveAlarm }>()
const { notification } = useNotification(() => props.alarm.notification)
const { t } = useI18n()
</script>

<template>
  <section v-if="notification" class="p-4 shadow-md rounded-lg border-2 border-accent-red bg-accent-red/10 grid gap-4">
    <header class="flex gap-4 items-center">
      <Icon class="size-8 fill-accent-red" icon="warning" />
      <h2 class="headline" v-text="notification.subject" />

      <span class="grow" />
      <Badge v-if="alarm.location">
        <Entity.Breadcrumbs v-slot="{ delimiter, rest, last }" :location="alarm.location" :room="alarm.room" :scanner="alarm.scanner" :device="alarm.device">
          <template v-if="rest.length">{{ rest + delimiter }}</template
          ><strong>{{ last }}</strong>
        </Entity.Breadcrumbs>
      </Badge>
      <Badge>{{ t('entity.led') }}: <BooleanIcon :value="alarm.led" /></Badge>
      <Badge>{{ t('entity.buzzer') }}: <BooleanIcon :value="alarm.buzzer" /></Badge>
    </header>

    <p v-if="notification.text" v-text="notification.text" />
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-else-if="notification.html" v-html="notification.html" />

    <slot />
  </section>
</template>
