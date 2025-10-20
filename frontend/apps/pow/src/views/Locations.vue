<script setup>
import { useLocationStore } from '@/stores/locationStore'
import { ref } from 'vue'

const locationStore = useLocationStore()
const newName = ref('')
</script>

<template>
  <h2>Locations</h2>
  <table>
    <thead>
      <tr>
        <th>Uuid</th>
        <th>Name</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="scanner of Object.values(locationStore.data)" :key="scanner.uuid">
        <td>{{ scanner.uuid }}</td>
        <td><input v-model="scanner.name" /></td>
        <td>
          <input type="submit" value="Save" @click="locationStore.save(scanner)" />
          <input type="submit" value="Remove" @click="locationStore.remove(scanner.uuid)" />
        </td>
      </tr>
      <tr>
        <td />
        <td><input v-model="newName" /></td>
        <input type="submit" value="Create" @click="locationStore.create(newName)" />
      </tr>
    </tbody>
  </table>
</template>

<style scoped></style>
