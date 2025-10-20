<template>
  <div class="flex items-center justify-center p-4">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span v-if="message" class="ml-2 text-gray-600">{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
const { message = 'Loading...' } = defineProps<{
  message?: string
}>()
</script>
