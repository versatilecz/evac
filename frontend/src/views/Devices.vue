<script setup>
import { useDeviceStore } from '@/stores/deviceStore'
const deviceStore = useDeviceStore()
</script>

<template>
    <h2>Devices</h2>
    <table>
        <thead>
            <tr>
                <th>Uuid</th>
                <th>Name</th>
                <th>Mac</th>
                <th>Enable</th>
            </tr>
        </thead>

        <tbody>
            <tr v-for="device of Object.values(deviceStore.data)" :key="device.uuid">
                <td>{{ device.uuid }}</td>
                <td><input v-model="device.name"></td>
                <td>{{ device.mac }}</td>
                <td><input type="checkbox" v-model="device.enable"></td>
                <td>
                    <input type="submit" value="Save" v-on:click="deviceStore.save(device)">
                    <input type="submit" value="Remove" v-on:click="deviceStore.remove(device.uuid)">
                </td>
        </tr>
        </tbody>
    </table>
</template>

<style scoped>
table {
    width: 100%;
}
</style>