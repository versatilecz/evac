<script setup lang="ts">
import { Badge, BooleanIcon, Entity, Icon } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import type { $ActiveAlarm } from '@/definitions'

const props = defineProps<{ alarm: $ActiveAlarm }>()
const { t } = useI18n()
</script>

<template>
  <section class="p-4 shadow-md rounded-lg border-2 border-accent-red bg-accent-red/10 grid gap-4">
    <header class="flex gap-4 items-center">
      <Icon class="size-8 fill-accent-red" icon="warning" />
      <h2 class="headline" v-text="alarm.subject" />

      <span class="grow" />
      <Badge v-if="alarm.location">
        <Entity.Breadcrumbs :location="alarm.location" :room="alarm.room" :scanner="alarm.scanner" :device="alarm.device" v-slot="{ delimiter, rest, last }">
          <template v-if="rest.length">{{ rest + delimiter }}</template
          ><strong>{{ last }}</strong>
        </Entity.Breadcrumbs>
      </Badge>
      <Badge>{{ t('entity.led') }}: <BooleanIcon :value="alarm.led" /></Badge>
      <Badge>{{ t('entity.buzzer') }}: <BooleanIcon :value="alarm.buzzer" /></Badge>
    </header>

    <p v-if="alarm.text" v-text="alarm.text" />
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-else-if="alarm.html" v-html="alarm.html" />

    <slot />
  </section>
</template>
