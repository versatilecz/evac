<script setup>
import { useRoomStore } from '@/stores/roomStore'
import {  ref } from 'vue';
import LocationSelect from '@/component/LocationSelect.vue';

const roomStore = useRoomStore()
const newName = ref('')
const newLocation = ref(null)


</script>

<template>
    <h2>Rooms</h2>
    <table>
        <thead>
            <tr>
                <th>Uuid</th>
                <th>Name</th>
                <th>Location</th>
            </tr>
        </thead>

        <tbody>
            <tr v-for="room of Object.values(roomStore.data)" :key="room.uuid">
                <td>{{ room.uuid }}</td>
                <td><input v-model="room.name"></td>
                <td><LocationSelect v-model="room.location"></LocationSelect></td>
                <td>
                    <input type="submit" value="Save" v-on:click="roomStore.save(room)">
                    <input type="submit" value="Remove" v-on:click="roomStore.remove(room.uuid)">
                </td>
            </tr>
            <tr>
                <td></td>
                <td><input v-model="newName"></td>
                <td><LocationSelect v-model="newLocation"></LocationSelect></td>
                <input type="submit" value="Create" v-on:click="roomStore.create(newName, newLocation)">

            </tr>
        </tbody>
    </table>
</template>

<style scoped>

</style>