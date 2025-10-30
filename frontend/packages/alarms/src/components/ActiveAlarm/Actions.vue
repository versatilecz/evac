<script setup lang="ts">
import { useEmails } from '@evac/emails'
import { Icon } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { useActiveAlarm } from '@/composables'

const { t } = useI18n()
const { stop } = useActiveAlarm()
const { list: emails, send: sendEmail } = useEmails()
</script>

<template>
  <div class="flex flex-wrap gap-4 justify-between items-center">
    <template v-for="email of emails" :key="email.uuid">
      <button type="button" class="btn btn-filled" @click="sendEmail.submit(email)">
        <Icon icon="mail" />
        {{ email.name }}
      </button>
    </template>

    <span class="grow" />
    <button type="button" class="btn btn-filled" :disabled="stop.ongoing.value" @click="stop.submit()">
      <Icon icon="warning_off" />
      {{ t('alarm.stop') }}
    </button>
  </div>
</template>
