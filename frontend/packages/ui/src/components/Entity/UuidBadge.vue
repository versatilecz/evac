<script setup lang="ts">
import { useAuth } from '@evac/auth'
import { useI18n } from 'vue-i18n'
import Badge from '../Badge.vue'
import Uuid from './Uuid.vue'

defineProps<{
  entity: object | null | undefined
}>()

const { isDebug } = useAuth()
const { t } = useI18n({ useScope: 'global' })
</script>

<template>
  <Uuid v-if="isDebug" :entity="entity" v-slot="{ uuid }">
    <Badge>{{ t('entity.uuid') }} {{ uuid }}</Badge>
  </Uuid>
</template>
