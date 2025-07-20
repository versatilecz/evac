<script setup>
import { useAlarmStore } from '@/stores/alarmStore';
const alarmStore = useAlarmStore()
const model = defineModel()

</script>

<template>
  <select v-model="model">
    <option v-for="alarm of Object.values(alarmStore.data)" :key="alarm.uuid" :value="alarm">{{ alarm.name }}</option>
  </select>
  </template>