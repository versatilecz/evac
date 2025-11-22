<script setup lang="ts">
import { Icon } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { useActiveAlarm } from '@/composables'
import type { AlarmInfo } from '@/definitions'

defineProps<{ alarmInfo: AlarmInfo }>()
const { t } = useI18n()
const { stop } = useActiveAlarm()
</script>

<template>
  <div v-if="alarmInfo" class="flex flex-wrap gap-4 justify-between items-center">
    <span class="grow" />
    <button type="button" class="btn btn-filled" :disabled="stop.ongoing.value" @click="stop.submit(alarmInfo.uuid)">
      <Icon icon="warning_off" />
      {{ t('alarm.stop') }}
    </button>
  </div>
</template>
