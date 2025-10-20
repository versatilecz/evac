<script setup lang="ts">
defineProps<{ icon: string }>()
</script>

<template>
  <svg class="icon" aria-hidden="true">
    <use :href="`#icon-${icon}`" />
  </svg>
</template>
