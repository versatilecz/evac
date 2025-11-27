<script setup lang="ts">
import * as Auth from '@evac/auth'
import { LoginForm } from '@evac/ui'
import { RouterView } from 'vue-router'
</script>

<template>
  <Auth.Wall>
    <RouterView />
    <template #login>
      <LoginForm class="place-self-center" />
    </template>
  </Auth.Wall>
</template>
