<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useBackups } from '@/tools/backup'
import Form from './Form.vue'
import Cards from './Cards.vue'

const { t } = useI18n({ useScope: 'global' })
const { list } = useBackups()
</script>

<template>
  <section>
    <header>
      <h1 class="headline">{{ t('config.tools.backups') }}</h1>
    </header>
    <Cards class="mt-4" :backups="list">
      <Form />
    </Cards>
  </section>
</template>
