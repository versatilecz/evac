<script setup>
import { useDeviceStore } from '@/stores/deviceStore'
const deviceStore = useDeviceStore()
import { formatMac, formatDate } from '@/utils'
import { computed,ref } from 'vue';

const all = ref(false);
const devices = computed(() => Object.values(deviceStore.data).filter(d => all.value || d.enable))
</script>

<template>
    <h2>Devices</h2>
    <fieldset>
        <legend>Filter</legend>

        <input id="filter_all" type="checkbox" v-model="all">
        <label for="filter_all">All</label>

    </fieldset>
    <table>
        <thead>
            <tr>
                <th>Uuid</th>
                <th>Název</th>
                <th>Mac</th>
                <th>Baterie</th>
                <th>Poslední aktivita</th>
                <th>Povoleno</th>
            </tr>
        </thead>

        <tbody>
            <tr v-for="device of devices" :key="device.uuid">
                <td>{{ device.uuid }}</td>
                <td><input v-model="device.name"></td>
                <td>{{ formatMac(device.mac)  }}</td>
                <td>{{ device.battery }}%</td>
                <td>{{ formatDate(device.lastActivity, 'short', 'short')}}</td>

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