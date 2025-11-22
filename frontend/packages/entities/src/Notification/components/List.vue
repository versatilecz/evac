<script setup lang="ts">
import { List, useListContext } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import type * as def from '../definitions'
import ListItem from './ListItem.vue'

defineProps<{
  notifications: Iterable<def.Detail>
}>()
const { t } = useI18n({ useScope: 'global' })
const { gridStyle, rowStyle, visible } = useListContext(true)
</script>

<template>
  <section class="list grid content-start" :style="gridStyle">
    <header class="headline" :style="rowStyle">
      <List.SortTrigger v-if="visible.name" sort-key="name">{{ t('entity.name') }}</List.SortTrigger>
      <List.SortTrigger v-if="visible.uuid" class="justify-self-center" sort-key="uuid">{{ t('entity.uuid') }}</List.SortTrigger>
      <List.SortTrigger v-if="visible.subject" class="justify-self-start" sort-key="subject">{{ t('entity.subject') }}</List.SortTrigger>
      <List.SortTrigger v-if="visible.short" class="justify-self-start" sort-key="short">{{ t('entity.shortText') }}</List.SortTrigger>
      <List.SortTrigger v-if="visible.long" class="justify-self-start" sort-key="long">{{ t('entity.longText') }}</List.SortTrigger>
    </header>
    <template v-for="notification of notifications" :key="notification.uuid">
      <ListItem :style="rowStyle" :notification="notification" />
    </template>
    <slot />
  </section>
</template>
