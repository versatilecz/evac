<script setup lang="ts">
import { useAuth } from '@evac/auth'
import { Badge } from '@evac/ui'
import type { Detail } from '../definitions'
import { isEmailKind, isSmsKind } from '../misc'
import Label from './Label.vue'

defineProps<{ contact: Detail }>()
defineOptions({ inheritAttrs: false })
const { isDebug } = useAuth()
</script>

<template>
  <button type="button" class="btn btn-surface grid gap-0 py-3 h-auto justify-start justify-items-start content-center" v-bind="$attrs">
    <span class="flex gap-2">
      <Label :contact="contact" />
    </span>
    <template v-if="isEmailKind(contact)">
      <span class="text-sm">{{ contact.kind.email.email }}</span>
    </template>
    <template v-else-if="isSmsKind(contact)">
      <span class="text-sm">{{ contact.kind.sms.number }}</span>
    </template>
    <Badge v-if="isDebug">{{ contact.uuid }}</Badge>
  </button>
</template>
