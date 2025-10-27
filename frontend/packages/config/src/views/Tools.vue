<script setup lang="ts">
import { useAuth } from '@evac/auth'
import { ContentHeader, Switch } from '@evac/ui'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })
const { isDebug } = useAuth()
</script>

<template>
  <ContentHeader :description="t('config.tools.description', '')">
    <template #title>
      <h1 class="headline">{{ t('config.tools.title') }}</h1>
    </template>
  </ContentHeader>
  <form class="px-6 py-4">
    <label class="flex items-center gap-4">
      <strong>Debug mode</strong>
      <Switch.Root id="debug-mode" v-model="isDebug" class="btn switch">
        <Switch.Thumb class="thumb" />
      </Switch.Root>
    </label>
  </form>
</template>
