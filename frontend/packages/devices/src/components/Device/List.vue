<script setup lang="ts">
import { List, useListContext } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import type { $Device } from '@/definitions'
import ListItem from './ListItem.vue'

defineProps<{
  devices: Iterable<$Device>
}>()
const { t } = useI18n({ useScope: 'global' })
const { gridStyle, rowStyle, visible } = useListContext(true)
</script>

<template>
  <section class="list grid content-start" :style="gridStyle">
    <header class="headline" :style="rowStyle">
      <List.SortTrigger v-if="visible.name" sort-key="name">{{ t('entity.name') }}</List.SortTrigger>
      <List.SortTrigger v-if="visible.uuid" class="justify-self-center" sort-key="uuid">{{ t('entity.uuid') }}</List.SortTrigger>
      <List.SortTrigger v-if="visible.mac" class="justify-self-center" sort-key="mac">{{ t('entity.mac') }}</List.SortTrigger>
      <List.SortTrigger v-if="visible.battery" class="justify-self-right" sort-key="battery">{{ t('entity.battery') }}</List.SortTrigger>
      <List.SortTrigger v-if="visible.lastActivity" class="justify-self-center" sort-key="lastActivity">{{ t('entity.activity') }}</List.SortTrigger>
      <List.SortTrigger v-if="visible.enabled" class="justify-self-center" sort-key="enabled">{{ t('entity.enabled') }}</List.SortTrigger>
    </header>
    <template v-for="device of devices" :key="device.uuid">
      <ListItem :style="rowStyle" :device="device" />
    </template>
    <slot />
  </section>
</template>
