<script setup lang="ts">
import { ContentHeader, Switch, useDebug } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { Backup } from '@/components'

const { t } = useI18n({ useScope: 'global' })
const { state } = useDebug()
</script>

<template>
  <ContentHeader :description="t('config.tools.description', '')">
    <template #title>
      <h1 class="headline">{{ t('config.tools.title') }}</h1>
    </template>
  </ContentHeader>
  <div class="py-4">
    <form class="px-6">
      <label class="flex items-center gap-4">
        <strong>{{ t('config.tools.debug') }}</strong>
        <Switch.Root id="debug-mode" v-model="state" class="btn switch">
          <Switch.Thumb class="thumb" />
        </Switch.Root>
      </label>
    </form>

    <Backup.Section class="px-6 mt-8" />
  </div>
</template>
