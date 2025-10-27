<script setup lang="ts">
import { List, useListContext } from '@evac/ui'
import type { $Scanner } from '@/definitions'
import ListItem from './ListItem.vue'

defineProps<{
  scanners: Iterable<$Scanner>
}>()
defineEmits<{
  (e: 'update:sort', key: keyof $Scanner): void
}>()
const { gridStyle, rowStyle, visible } = useListContext(true)
</script>

<template>
  <section class="list grid content-start" :style="gridStyle">
    <header class="headline" :style="rowStyle">
      <List.SortTrigger v-if="visible.name" sort-key="name">Name</List.SortTrigger>
      <List.SortTrigger v-if="visible.room" sort-key="room">Room</List.SortTrigger>
      <List.SortTrigger v-if="visible.uuid" class="justify-self-center" sort-key="uuid">UUID</List.SortTrigger>
      <List.SortTrigger v-if="visible.mac" class="justify-self-center" sort-key="mac">MAC</List.SortTrigger>
      <List.SortTrigger v-if="visible.ip" class="justify-self-center" sort-key="ip">IP</List.SortTrigger>
      <List.SortTrigger v-if="visible.lastActivity" class="justify-self-end" sort-key="lastActivity">Activity</List.SortTrigger>
      <List.SortTrigger v-if="visible.buzzer" class="justify-self-center" sort-key="buzzer">Buzzer</List.SortTrigger>
      <List.SortTrigger v-if="visible.led" class="justify-self-center" sort-key="led">LED</List.SortTrigger>
      <List.SortTrigger v-if="visible.scan" class="justify-self-center" sort-key="scan">Scan</List.SortTrigger>
    </header>
    <template v-for="scanner of scanners" :key="scanner.uuid">
      <ListItem :style="rowStyle" :scanner="scanner" />
    </template>
    <slot />
  </section>
</template>
