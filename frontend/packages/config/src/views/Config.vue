<script setup lang="ts">
import { ContentHeader } from '@evac/ui'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })
</script>

<template>
  <ContentHeader :description="t('config.config.description', '')">
    <template #title>
      <h1 class="headline">{{ t('config.config.title') }}</h1>
    </template>
  </ContentHeader>
</template>
