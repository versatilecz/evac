<script setup lang="ts">
import { PageContainer } from '@evac/ui'
import { Navigation } from '../components'
</script>

<template>
  <PageContainer class="grid grid-rows-[max-content_1fr]" data-scope="config">
    <template #pre>
      <Navigation />
    </template>
    <RouterView />
  </PageContainer>
</template>
