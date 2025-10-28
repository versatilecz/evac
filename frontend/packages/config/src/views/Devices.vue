<script setup lang="ts">
import { useAuth } from '@evac/auth'
import { Badge, ContentHeader, defineListFields, useList } from '@evac/ui'
import { DEFAULT_SORT, Device, useDevices } from '@evac/devices'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })
const auth = useAuth()

const fields = defineListFields(
  { key: 'name', fill: true },
  { key: 'uuid', visible: () => auth.isDebug.value },
  { key: 'mac', visible: () => auth.isDebug.value },
  { key: 'battery' },
  { key: 'lastActivity' },
  { key: 'enabled' }
)
const { sort } = useList({ initialSort: DEFAULT_SORT, fields })
const { count, list: devices } = useDevices({ sort })
</script>

<template>
  <ContentHeader :description="t('devices.config.description', '')">
    <template #title>
      <h1 class="headline">{{ t('devices.config.title') }}</h1>
      <Badge>{{ count }}</Badge>
      <span class="grow" />
    </template>
  </ContentHeader>
  <Device.List class="pb-12" :devices="devices" />
</template>
