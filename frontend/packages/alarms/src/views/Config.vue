<script setup lang="ts">
import { Badge, ContentHeader, defineListFields, useDebug, useList } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { Alarm } from '@/components'
import { useAlarms } from '@/composables'
import { DEFAULT_SORT } from '@/definitions'

const { t } = useI18n({ useScope: 'global' })
const { enabled: debugEnabled } = useDebug()

const fields = defineListFields(
  { key: 'name' },
  { key: 'uuid', visible: () => debugEnabled.value },
  { key: 'notification' },
  { key: 'group', fill: true },
  { key: 'buzzer' },
  { key: 'led' }
)
const { sort } = useList({ initialSort: DEFAULT_SORT, fields })
const { count, list: alarms } = useAlarms({ sort })
</script>

<template>
  <ContentHeader :description="t('alarms.config.description', '')">
    <template #title>
      <h1 class="headline">{{ t('alarms.config.title') }}</h1>
      <Badge>{{ count }}</Badge>
      <span class="grow" />
      <Alarm.Dialog />
    </template>
  </ContentHeader>
  <Alarm.List :alarms="alarms" />
</template>
