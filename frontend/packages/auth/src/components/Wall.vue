<script setup lang="ts">
import { useAuth } from '@/composables'

const { isAuthenticated } = useAuth()
</script>

<template>
  <template v-if="isAuthenticated">
    <slot />
  </template>
  <div class="grid grid-rows-[auto_1fr] w-screen h-screen bg-surface">
    <header class="h-20 flex px-6 items-center">
      <h1 class="text-2xl font-black">EVAC</h1>
    </header>
    <slot name="login" />
  </div>
</template>
