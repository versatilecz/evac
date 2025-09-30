<template>
  <div class="container mx-auto px-4 py-8">
    <PageHeader title="Welcome to EVAC MVP" subtitle="Emergency Evacuation Management System - Minimum Viable Product" />

    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold mb-2">Dashboard</h3>
        <p class="text-gray-600">Monitor system status and alerts</p>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold mb-2">Locations</h3>
        <p class="text-gray-600">Manage evacuation locations</p>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold mb-2">Reports</h3>
        <p class="text-gray-600">View evacuation reports and analytics</p>
      </div>
    </div>

    <div class="mt-8">
      <LoadingSpinner v-if="isLoading" message="Loading data..." />
      <EmptyState v-else title="Ready to go!" description="The MVP is ready for development." />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LoadingSpinner, EmptyState, PageHeader } from '@evac/ui'

const isLoading = ref(false)
</script>
