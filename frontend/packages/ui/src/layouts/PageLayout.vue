<script setup lang="ts">
import { PageFooter, PageHeader } from '../components'
</script>

<template>
  <div class="page">
    <PageHeader class="row-start-1 col-span-3" />
    <slot />
    <PageFooter class="row-start-3 col-span-3" />
  </div>
</template>
