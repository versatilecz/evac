<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useDebug } from '@/composables/debug'
import Badge from '../Badge.vue'
import Uuid from './Uuid.vue'

defineProps<{ entity: object | null | undefined }>()
defineOptions({ inheritAttrs: false })

const { enabled: debugEnabled } = useDebug()
const { t } = useI18n({ useScope: 'global' })
</script>

<template>
  <Uuid v-if="debugEnabled" v-slot="{ uuid }" :entity="entity">
    <Badge v-bind="$attrs">{{ t('entity.uuid') }} {{ uuid }}</Badge>
  </Uuid>
</template>
