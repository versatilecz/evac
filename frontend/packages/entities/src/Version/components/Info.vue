<script setup lang="ts">
import { Badge, useDebug } from '@evac/ui'
import Root from './Root.vue'

defineOptions({ inheritAttrs: false })
const { enabled: debugEnabled } = useDebug()
</script>

<template>
  <Root v-slot="{ state }">
    <template v-if="state">
      <Badge v-if="debugEnabled">{{ state.commit }}</Badge>
      {{ state.number }}
    </template>
  </Root>
</template>
