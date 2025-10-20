<script setup lang="ts">
import { useAuth } from '@evac/auth'
import { Badge } from '@evac/ui'
import type { $Location } from '@/definitions'
import Dialog from './Dialog.vue'

defineProps<{ location: $Location }>()
defineOptions({ inheritAttrs: false })
const auth = useAuth()
</script>

<template>
  <Dialog class="row-start-1 col-start-2 place-self-center" :location="location">
    <button type="button" class="btn btn-surface min-h-24 grid gap-2 place-content-center" v-bind="$attrs">
      <strong class="value">{{ location.name }}</strong>
      <template v-if="auth.isAdmin">
        <Badge>{{ location.uuid }}</Badge>
      </template>
    </button>
  </Dialog>
</template>
