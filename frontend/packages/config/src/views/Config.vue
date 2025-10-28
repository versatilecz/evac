<script setup lang="ts">
import { ContentHeader } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { BaseConfig, useBaseConfig } from '@/base'

const { t } = useI18n({ useScope: 'global' })
const base = useBaseConfig()
</script>

<template>
  <ContentHeader :description="t('config.config.description', '')">
    <template #title>
      <h1 class="headline">{{ t('config.config.title') }}</h1>
    </template>
  </ContentHeader>

  <div class="py-4">
    <BaseConfig.Form v-if="base" class="px-6" :config="base" />
  </div>
</template>
