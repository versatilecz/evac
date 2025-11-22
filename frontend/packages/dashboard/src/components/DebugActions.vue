<script setup lang="ts">
import { ActiveAlarm, ICON } from '@evac/alarms'
import '@evac/auth'
import { Icon } from '@evac/ui'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })
</script>

<template>
  <ActiveAlarm.Dialog v-if="$auth.isDebug">
    <template #trigger>
      <button type="button" class="btn">
        <Icon :icon="ICON" />
        {{ t('alarm.dialog.run') }}
      </button>
    </template>
  </ActiveAlarm.Dialog>
</template>
