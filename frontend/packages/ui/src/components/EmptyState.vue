<template>
  <div class="text-center py-12">
    <div class="mx-auto h-12 w-12 text-gray-400 mb-4">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H6a1 1 0 00-1 1v1m0 0V4a2 2 0 012-2h12a2 2 0 012 2v1M5 5h14"
        />
      </svg>
    </div>
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
