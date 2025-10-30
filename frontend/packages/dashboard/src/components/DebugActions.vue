<script setup lang="ts">
import { ActiveAlarm } from '@evac/alarms'
import { useAuth } from '@evac/auth'
import { TOOLS_ICON } from '@evac/config'
import { Icon } from '@evac/ui'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })
const { isDebug } = useAuth()
</script>

<template>
  <template v-if="isDebug">
    <ActiveAlarm.Dialog>
      <template #trigger>
        <button type="button" class="btn">
          <Icon :icon="TOOLS_ICON" />
          {{ t('alarm.dialog.create') }}
        </button>
      </template>
    </ActiveAlarm.Dialog>
  </template>
</template>
