<template>
  <div class="bg-white shadow-xs border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="py-6">
        <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
        <p v-if="subtitle" class="mt-2 text-sm text-gray-600">
          {{ subtitle }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: null,
  },
})
</script>
