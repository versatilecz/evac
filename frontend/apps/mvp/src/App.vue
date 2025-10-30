<script setup lang="ts">
import { DebugActions } from '@evac/dashboard'
import { PageLayout } from '@evac/ui'
import { RouterView } from 'vue-router'
</script>

<template>
  <PageLayout>
    <template #nav>
      <DebugActions />
    </template>
    <RouterView />
  </PageLayout>
</template>
