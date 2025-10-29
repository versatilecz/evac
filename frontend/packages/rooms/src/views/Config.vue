<script setup lang="ts">
import { useLocations } from '@evac/locations'
import { $SortDirection } from '@evac/shared'
import { Badge, ContentHeader } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { Room } from '@/components'
import { useRooms } from '@/composables'

const { t } = useI18n({ useScope: 'global' })
const { list } = useLocations({ sort: [{ key: 'name', direction: $SortDirection.enum.Ascending }] })
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
    <template v-for="location of list" :key="location.uuid">
      <h2 class="headline mb-4">{{ location.name }}</h2>
      <Room.Cards class="mb-12 grid content-start items-center" :rooms="rooms.get(location.uuid) ?? []" />
    </template>
  </section>
</template>
