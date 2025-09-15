<script setup>
import { useRoomStore } from "@/stores/roomStore";
const roomStore = useRoomStore();
const model = defineModel();
</script>

<template>
  <select v-model="model">
    <option
      v-for="room of Object.values(roomStore.data)"
      :key="room.uuid"
      :value="room.uuid"
    >
      {{ room.name }}
    </option>
  </select>
</template>
