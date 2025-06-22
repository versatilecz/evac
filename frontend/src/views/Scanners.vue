<script setup>
import { useScannerStore } from '@/stores/scannerStore'
import { computed } from 'vue';
import RoomSelect from '@/component/RoomSelect.vue';

const scannerStore = useScannerStore()

const assigned = computed(() => Object.values(scannerStore.data).filter(s => s.room !== null))
const unassigned = computed(() => Object.values(scannerStore.data).filter(s => s.room === null))

</script>

<template>
    <h2>Scanners - assigned</h2>
    <table>
        <thead>
            <tr>
                <th>Uuid</th>
                <th>Name</th>
                <th>Mac</th>
                <th>Ip</th>
                <th>Room</th>
                <th>Last activity</th>
            </tr>
        </thead>

        <tbody>
            <tr v-for="scanner of assigned" :key="scanner.uuid">
                <td>{{ scanner.uuid }}</td>
                <td><input v-model="scanner.name"></td>
                <td>{{ scanner.mac }}</td>
                <td>{{ scanner.ip }}</td>
                <td><RoomSelect v-model="scanner.room"></RoomSelect></td>
                <td>{{ scanner.lastActivity }}</td>
                <td>
                    <input type="submit" value="Save" v-on:click="scannerStore.save(scanner)">
                    <input type="submit" value="Remove" v-on:click="scannerStore.remove(scanner.uuid)">
                </td>
        </tr>
        </tbody>
        </table>
        <h2>Scanners - unassigned</h2>
        <table>



        <tbody>
            <tr v-for="scanner of unassigned" :key="scanner.uuid">
                <td>{{ scanner.uuid }}</td>
                <td><input v-model="scanner.name"></td>
                <td>{{ scanner.mac }}</td>
                <td>{{ scanner.ip }}</td>
                <td><RoomSelect v-model="scanner.room"></RoomSelect></td>
                <td>{{ scanner.lastActivity }}</td>
                <td>
                    <input type="submit" value="Save" v-on:click="scannerStore.save(scanner)">
                    <input type="submit" value="Remove" v-on:click="scannerStore.remove(scanner.uuid)">
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