<script setup lang="ts">
import '@evac/auth'
import { Badge } from '@evac/ui'
import Root from './Root.vue'

defineOptions({ inheritAttrs: false })
</script>

<template>
  <Root v-slot="{ backend }">
    <template v-if="backend">
      <Badge v-if="$auth.isDebug">{{ backend.commit }}</Badge>
      {{ backend.number }}
    </template>
  </Root>
</template>
