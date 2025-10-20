<script setup lang="ts">
import { useAuth } from '@evac/auth'
import { Badge, ContentHeader, defineListFields, useList } from '@evac/ui'
import { DEFAULT_SORT, Scanner, useScanners } from '@evac/scanners'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })
const auth = useAuth()

const fields = defineListFields(
  { key: 'name', fill: true },
  { key: 'room' },
  { key: 'uuid', visible: () => auth.isDebug.value },
  { key: 'mac', visible: () => auth.isDebug.value },
  { key: 'ip' },
  { key: 'lastActivity' },
  { key: 'buzzer' },
  { key: 'led' },
  { key: 'scan' }
)
const { sort } = useList({ initialSort: DEFAULT_SORT, fields })
const { count, list: scanners } = useScanners({ sort })
</script>

<template>
  <ContentHeader :description="t('scanners.config.description', '')">
    <template #title>
      <h1 class="headline">{{ t('scanners.config.title') }}</h1>
      <Badge>{{ count }}</Badge>
      <span class="grow" />
    </template>
  </ContentHeader>
  <Scanner.List class="pb-12" :scanners="scanners" />
</template>
