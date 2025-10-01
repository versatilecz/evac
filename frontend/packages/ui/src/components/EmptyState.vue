<template>
  <div class="text-center py-12 grid place-items-center gap-4">
    <svg class="size-16 fill-current text-gray-500"><use href="#icon-code" /></svg>
    <h3 class="text-lg font-medium text-gray-900 mb-2">{{ title }}</h3>
    <p class="text-gray-500">{{ description }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'No data available',
  },
  description: {
    type: String,
    default: 'There is no data to display at the moment.',
  },
})
</script>
