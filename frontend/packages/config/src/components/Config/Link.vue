<script setup lang="ts">
import { Icon } from '@evac/ui'
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router'

defineProps<{
  to: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric
  icon?: string
}>()
</script>

<template>
  <RouterLink v-slot="{ href, isActive, navigate }" :to="to" custom>
    <a :href="href" class="config-link" :class="{ active: isActive }" @click="navigate">
      <template v-if="icon">
        <Icon :icon="icon" />
      </template>
      <span class="col-start-2 text-right">
        <slot>{{ to }}</slot>
      </span>
    </a>
  </RouterLink>
</template>
