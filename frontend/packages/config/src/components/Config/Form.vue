<script setup lang="ts">
import { Icon, useFormat } from '@evac/ui'
import { onBeforeMount, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBackupActions, type $Backup } from '@/tools/backup'

const { t } = useI18n({ useScope: 'global' })
const formatter = useFormat()
const { set } = useBackupActions()

const id = useId()
const name = ref<$Backup>('')

onBeforeMount(mockName)

function mockName() {
  name.value = formatter.dateTime.format(new Date())
}
</script>

<template>
  <form @submit.prevent="set.submit(name).then(mockName)">
    <figcaption class="value col-span-2">{{ t('config.tools.newBackup') }}</figcaption>
    <input :id="id" v-model="name" class="input w-full" type="text" />
    <button type="submit" class="btn btn-filled">
      <Icon icon="add" />
      {{ t('action.create') }}
    </button>
  </form>
</template>
