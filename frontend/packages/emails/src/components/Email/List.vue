<script setup lang="ts">
import { List, useListContext } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import type { $Email } from '@/definitions'
import ListItem from './ListItem.vue'

defineProps<{
  emails: Iterable<$Email>
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
      <List.SortTrigger v-if="visible.text" class="justify-self-start" sort-key="text">{{ t('entity.text') }}</List.SortTrigger>
      <List.SortTrigger v-if="visible.buzzer" class="justify-self-center" sort-key="buzzer">{{ t('entity.buzzer') }}</List.SortTrigger>
      <List.SortTrigger v-if="visible.led" class="justify-self-center" sort-key="led">{{ t('entity.led') }}</List.SortTrigger>
    </header>
    <template v-for="email of emails" :key="email.uuid">
      <ListItem :style="rowStyle" :email="email" />
    </template>
    <slot />
  </section>
</template>
