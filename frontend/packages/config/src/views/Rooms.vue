<script setup lang="ts">
import { useLocations, sortBy } from '@evac/locations'
import { Room, useRooms } from '@evac/rooms'
import { Badge, ContentHeader } from '@evac/ui'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })
const { list: locations } = useLocations()
const { count, byLocation: rooms } = useRooms()
</script>

<template>
  <ContentHeader :description="t('rooms.config.description', '')">
    <template #title>
      <h1 class="headline">{{ t('rooms.config.title') }}</h1>
      <Badge>{{ count }}</Badge>
      <span class="grow" />
      <Room.Dialog />
    </template>
  </ContentHeader>
  <section class="px-6 list">
    <template v-for="location of sortBy(locations, 'name')" :key="location.uuid">
      <h2 class="headline mb-4">{{ location.name }}</h2>
      <Room.Cards class="mb-12 grid content-start items-center" :rooms="rooms.get(location.uuid) ?? []" />
    </template>
  </section>
</template>
