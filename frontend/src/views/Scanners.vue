<script setup>
import { useScannerStore } from '@/stores/scannerStore'
import RoomSelect from '@/component/RoomSelect.vue';
import { formatMac, formatDate } from '@/utils';
const scannerStore = useScannerStore()

</script>

<template>
    <h2>Scanners - assigned</h2>
    <table>
        <thead>
            <tr>
                <th>Uuid</th>
                <th>Název</th>
                <th>Mac</th>
                <th>Ip</th>
                <th>Místnost</th>
                <th>Poslední aktivita</th>
            </tr>
        </thead>

        <tbody>
            <tr v-for="scanner of Object.values(scannerStore.data)" :key="scanner.uuid">
                <td>{{ scanner.uuid }}</td>
                <td><input v-model="scanner.name"></td>
                <td>{{ formatMac(scanner.mac) }}</td>
                <td>{{ scanner.ip }}</td>
                <td><RoomSelect v-model="scanner.room" @change="scannerStore.save(scanner)"></RoomSelect></td>
                <td>{{ formatDate(scanner.lastActivity, 'short', 'short') }}</td>
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