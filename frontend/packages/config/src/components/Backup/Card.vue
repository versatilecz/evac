<script setup lang="ts">
import { Icon } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { useBackupActions, type $Backup } from '@/tools/backup'

defineProps<{ backup: $Backup }>()
const { t } = useI18n({ useScope: 'global' })
const { remove, restore } = useBackupActions()
</script>

<template>
  <figure class="bg-emphasis-1 rounded-md shadow-sm p-3 min-h-24 grid grid-cols-[1fr_auto] gap-2 items-center">
    <figcaption class="value col-span-2">{{ backup }}</figcaption>
    <button type="button" class="btn text-accent-red justify-self-end" @click="remove.submit(backup)">
      <Icon icon="delete" />
      {{ t('action.delete') }}
    </button>
    <button type="button" class="btn btn-filled" @click="restore.submit(backup)">
      <Icon icon="settings_backup_restore" />
      {{ t('action.restore') }}
    </button>
  </figure>
</template>
