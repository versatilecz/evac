<script setup lang="ts">
import { ActiveAlarm } from '@evac/alarms'
import { Event, useEvents, events$ } from '@evac/events'
import { PageContainer } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { SimpleDevicesOverview } from '@/components'

const { t } = useI18n({ useScope: 'global' })
const { list: events } = useEvents()
</script>

<template>
  <ActiveAlarm.Root v-slot="{ activeAlarm, isAlarm }">
    <PageContainer
      class="p-6 gap-8 grid grid-rows-[max-content_1fr_auto] grid-cols-2"
      :class="{
        'border-4 border-accent-red': isAlarm,
      }"
    >
      <!-- Events Section -->
      <section class="first:pt-4 grid gap-6 grid-rows-subgrid row-span-2 content-start">
        <h2 class="headline">{{ t('events.title') }}</h2>
        <Event.Cards class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] overflow-y-auto overflow-x-visible content-start" :events="events" />
      </section>

      <!-- Device Overview Section -->
      <SimpleDevicesOverview class="col-start-2 grid gap-0 grid-rows-subgrid row-span-2 content-start" />

      <!-- Actions Section -->
      <template v-if="activeAlarm">
        <ActiveAlarm.Message class="col-span-2" :alarm="activeAlarm" />
        <ActiveAlarm.Actions class="col-span-2" />
      </template>
    </PageContainer>
  </ActiveAlarm.Root>
</template>
