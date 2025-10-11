<script setup lang="ts">
import { Badge, ContentHeader } from '@evac/ui'
import { Location, useLocations } from '@evac/locations'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })
const { count, list: locations } = useLocations()
</script>

<template>
  <ContentHeader :description="t('locations.config.description', '')">
    <template #title>
      <h1 class="headline">{{ t('locations.config.title') }}</h1>
      <Badge>{{ count }}</Badge>
      <span class="grow" />
      <Location.Dialog />
    </template>
  </ContentHeader>
  <Location.Cards class="px-6 pb-12 grid content-start items-center" :locations="locations" />
</template>
