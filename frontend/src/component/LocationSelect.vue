<script setup>
import { useLocationStore } from '@/stores/locationStore'
const locationStore = useLocationStore()
const model = defineModel()

</script>

<template>
  <select v-model="model">
    <option v-for="location of Object.values(locationStore.data)" :key="location.uuid" :value="location.uuid">{{ location.name }}</option>
  </select>
  </template>