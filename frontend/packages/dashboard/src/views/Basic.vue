<script setup lang="ts">
import { ActiveAlarm } from '@evac/alarms'
import { PageContainer } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { SimpleDevicesOverview } from '@/components'

const { t } = useI18n({
  messages: {
    en: {
      events: 'Events',
      actions: 'Actions',
    },
    cs: {
      events: 'Události',
      actions: 'Akce',
    },
  },
})
</script>

<template>
  <ActiveAlarm.Root v-slot="{ activeAlarm, isAlarm }">
    <PageContainer
      class="p-6 gap-8 grid grid-rows-[1fr_auto] grid-cols-2"
      :class="{
        'border-4 border-accent-red': isAlarm,
      }"
    >
      <!-- Events Section -->
      <div class="grid gap-y-6 content-start">
        <section class="first:pt-4">
          <h2 class="headline">{{ t('events') }}</h2>
        </section>
      </div>

      <!-- Device Overview Section -->
      <SimpleDevicesOverview class="col-start-2" />

      <!-- Actions Section -->
      <template v-if="activeAlarm">
        <ActiveAlarm.Message class="col-span-2" :alarm="activeAlarm" />
        <ActiveAlarm.Actions class="col-span-2" />
      </template>
    </PageContainer>
  </ActiveAlarm.Root>
</template>
