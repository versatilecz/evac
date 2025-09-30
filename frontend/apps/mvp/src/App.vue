<template>
  <div id="app">
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <RouterLink to="/" class="text-xl font-bold text-gray-900"> EVAC MVP </RouterLink>
          </div>
          <div class="flex items-center space-x-4">
            <RouterLink to="/" class="text-gray-700 hover:text-gray-900"> Home </RouterLink>
            <RouterLink to="/about" class="text-gray-700 hover:text-gray-900"> About </RouterLink>
          </div>
        </div>
      </div>
    </nav>

    <main class="min-h-screen bg-gray-50">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>
