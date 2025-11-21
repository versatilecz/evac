<script setup lang="ts">
import { ActiveAlarm, ICON } from '@evac/alarms'
import { useAuth } from '@evac/auth'
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
          <Icon :icon="ICON" />
          {{ t('alarm.dialog.run') }}
        </button>
      </template>
    </ActiveAlarm.Dialog>
  </template>
</template>
