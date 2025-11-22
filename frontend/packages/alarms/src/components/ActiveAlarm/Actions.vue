<script setup lang="ts">
import { useNotifications } from '@evac/notifications'
import { Icon } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { useActiveAlarm } from '@/composables'

const { t } = useI18n()
const { stop } = useActiveAlarm()
const { list: notifications, send: sendNotification } = useNotifications()
</script>

<template>
  <div class="flex flex-wrap gap-4 justify-between items-center">
    <template v-for="notification of notifications" :key="notification.uuid">
      <button type="button" class="btn btn-filled" @click="sendNotification.submit(notification)">
        <Icon icon="mail" />
        {{ notification.name }}
      </button>
    </template>

    <span class="grow" />
    <button type="button" class="btn btn-filled" :disabled="stop.ongoing.value" @click="stop.submit()">
      <Icon icon="warning_off" />
      {{ t('alarm.stop') }}
    </button>
  </div>
</template>
