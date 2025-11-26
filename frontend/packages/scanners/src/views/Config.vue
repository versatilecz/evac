<script setup lang="ts">
import { Badge, ContentHeader, defineListFields, useDebug, useList } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { Scanner } from '@/components'
import { useScanners } from '@/composables'
import { DEFAULT_SORT } from '@/definitions'

const { t } = useI18n({ useScope: 'global' })
const { enabled: debugEnabled } = useDebug()

const fields = defineListFields(
  { key: 'name', fill: true },
  { key: 'room' },
  { key: 'uuid', visible: () => debugEnabled.value },
  { key: 'mac', visible: () => debugEnabled.value },
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
  <Scanner.List v-if="scanners.length" class="pb-12" :scanners="scanners" />
  <div v-else class="px-6">
    <p class="paragraph p-4 text-center border-emphasis-4 border rounded-md">{{ t('scanners.empty') }}</p>
  </div>
</template>
