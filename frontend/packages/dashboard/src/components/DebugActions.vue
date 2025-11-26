<script setup lang="ts">
import { ActiveAlarm, ICON } from '@evac/alarms'
import { Icon, useDebug } from '@evac/ui'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })
const { enabled: debugEnabled } = useDebug()
</script>

<template>
  <ActiveAlarm.Dialog v-if="debugEnabled">
    <template #trigger>
      <button type="button" class="btn">
        <Icon :icon="ICON" />
        {{ t('alarm.dialog.run') }}
      </button>
    </template>
  </ActiveAlarm.Dialog>
</template>
