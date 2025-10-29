<script setup lang="ts">
import { useAuth } from '@evac/auth'
import { Badge, ContentHeader, defineListFields, useList } from '@evac/ui'
import { DEFAULT_SORT, Email, useEmails } from '@evac/emails'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })
const auth = useAuth()

const fields = defineListFields(
  { key: 'name' },
  { key: 'uuid', visible: () => auth.isDebug.value },
  { key: 'subject' },
  { key: 'text', fill: true },
  { key: 'buzzer' },
  { key: 'led' }
)
const { sort } = useList({ initialSort: DEFAULT_SORT, fields })
const { count, list: emails } = useEmails({ sort })
</script>

<template>
  <ContentHeader :description="t('emails.config.description', '')">
    <template #title>
      <h1 class="headline">{{ t('emails.config.title') }}</h1>
      <Badge>{{ count }}</Badge>
      <span class="grow" />
      <Email.Dialog />
    </template>
  </ContentHeader>
  <Email.List :emails="emails" />
</template>
