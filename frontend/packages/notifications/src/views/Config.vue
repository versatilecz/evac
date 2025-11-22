<script setup lang="ts">
import { useAuth } from '@evac/auth'
import { Badge, ContentHeader, defineListFields, useList } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { Notification } from '@/components'
import { useNotifications } from '@/composables'
import { DEFAULT_SORT } from '@/definitions'

const { t } = useI18n({ useScope: 'global' })
const { isDebug } = useAuth()

const fields = defineListFields({ key: 'name' }, { key: 'uuid', visible: () => isDebug.value }, { key: 'subject' }, { key: 'short', fill: true }, { key: 'long', fill: true })
const { sort } = useList({ initialSort: DEFAULT_SORT, fields })
const { count, list: notifications } = useNotifications({ sort })
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
