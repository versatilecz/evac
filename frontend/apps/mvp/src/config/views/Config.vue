<script setup lang="ts">
import { PageContainer, PageLayout } from '@evac/ui'
import { Navigation } from '../components'
</script>

<template>
  <PageLayout class="page-with-sidebar">
    <PageContainer class="grid grid-rows-[max-content_1fr]" data-scope="config">
      <template #pre>
        <Navigation />
      </template>
      <RouterView />
    </PageContainer>
  </PageLayout>
</template>
