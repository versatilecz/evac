<script setup lang="ts">
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
  <PageContainer class="p-6 gap-4 grid grid-rows-[1fr_auto] grid-cols-2">
    <!-- Events Section -->
    <section class="pt-4">
      <h2 class="headline">{{ t('events') }}</h2>
      <!-- TBD -->
    </section>

    <!-- Device Overview Section -->
    <SimpleDevicesOverview class="col-start-2" />

    <!-- Actions Section -->
    <section class="col-span-2">
      <h2 class="mb-4 text-xl font-semibold text-gray-900">{{ t('actions') }}</h2>
      <!-- TBD -->
    </section>
  </PageContainer>
</template>
