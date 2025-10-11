<script setup lang="ts">
import { PageContainer } from '@evac/ui'
import { Config } from '@/components'
</script>

<template>
  <PageContainer class="grid grid-rows-[max-content_1fr]" data-scope="config">
    <template #pre>
      <Config.Navigation />
    </template>
    <RouterView />
  </PageContainer>
</template>
