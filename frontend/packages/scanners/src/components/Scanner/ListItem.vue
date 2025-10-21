<script setup lang="ts">
import { useAuth } from '@evac/auth'
import { Badge } from '@evac/ui'
import { formatDate } from '@evac/utils'
import { useI18n } from 'vue-i18n'
import type { $Scanner } from '@/definitions'
import Dialog from './Dialog.vue'

defineProps<{ scanner: $Scanner }>()
defineOptions({ inheritAttrs: false })
const { locale } = useI18n({ useScope: 'global' })
const auth = useAuth()
</script>

<template>
  <Dialog :scanner="scanner">
    <button type="button" class="grid grid-cols-subgrid not-first:border-t h-12 items-center px-6 gap-4" v-bind="$attrs">
      <strong class="value text-left">{{ scanner.name }}</strong>
      <template v-if="auth.isAdmin">
        <Badge>{{ scanner.uuid }}</Badge>
        <Badge>{{ scanner.mac }}</Badge>
      </template>
      <Badge>{{ scanner.ip }}{{ scanner.port ? `:${scanner.port}` : '' }}</Badge>
      <span class="value text-right">{{ formatDate(scanner.lastActivity, locale) }}</span>
    </button>
  </Dialog>
</template>
