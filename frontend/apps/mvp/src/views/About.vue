<template>
  <div class="container mx-auto px-4 py-8">
    <PageHeader title="About EVAC MVP" subtitle="Learn more about the Emergency Evacuation Management System" />

    <div class="mt-8 bg-white rounded-lg shadow-sm p-6">
      <h2 class="text-2xl font-bold mb-4">Project Overview</h2>
      <p class="text-gray-600 mb-4">
        This is the MVP (Minimum Viable Product) for the EVAC system, built with modern web technologies:
      </p>

      <ul class="list-disc list-inside text-gray-600 space-y-2">
        <li>Vue 3 with Composition API and TypeScript</li>
        <li>Vue Router for navigation</li>
        <li>Tailwind CSS for styling</li>
        <li>Reka UI component library</li>
        <li>VueUse composables</li>
        <li>RxJS for reactive programming</li>
        <li>Unstorage for state management</li>
        <li>Nx monorepo architecture</li>
      </ul>

      <div class="mt-6">
        <button class="bg-blue-600 text-white px-4 py-2 rounded-sm hover:bg-blue-700" @click="handleClick">Test Button</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '@evac/utils'
import { PageHeader } from '@evac/ui'

const handleClick = () => {
  const today = new Date()
  alert(`Today is ${formatDate(today)}`)
}
</script>
