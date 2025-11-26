<script setup lang="ts">
import { Badge, ContentHeader, defineListFields, useDebug, useList } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import * as Notification from '../components'
import { useState } from '../composables'
import * as def from '../definitions'

const { t } = useI18n({ useScope: 'global' })
const { enabled: debugEnabled } = useDebug()

const fields = defineListFields({ key: 'name' }, { key: 'uuid', visible: () => debugEnabled.value }, { key: 'subject' }, { key: 'short', fill: true }, { key: 'long', fill: true })
const { sort } = useList({ initialSort: def.DEFAULT_SORT, fields })
const { count, list: notifications } = useState({ sort })
</script>

<template>
  <ContentHeader :description="t('notifications.config.description', '')">
    <template #title>
      <h1 class="headline">{{ t('notifications.config.title') }}</h1>
      <Badge>{{ count }}</Badge>
      <span class="grow" />
      <Notification.Dialog />
    </template>
  </ContentHeader>
  <Notification.List :notifications="notifications" />
</template>
