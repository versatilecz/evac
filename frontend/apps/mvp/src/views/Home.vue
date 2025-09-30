<script setup lang="ts">
import { useBaseConfig } from '@evac/config'
import { EmptyState, PageHeader } from '@evac/ui'

const baseConfig = useBaseConfig()
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <PageHeader title="Welcome to EVAC MVP" subtitle="Emergency Evacuation Management System - Minimum Viable Product" />

    <section v-if="baseConfig" class="mt-6 bg-gray-100 p-4 rounded-lg shadow-sm">
      <pre><code>{{ baseConfig }}</code></pre>
    </section>

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
      <EmptyState title="Ready to go!" description="The MVP is ready for development." />
    </div>
  </div>
</template>
