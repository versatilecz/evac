<script setup>
import { useConfigStore } from '@/stores/configStore'

const configStore = useConfigStore()
</script>

<template>
    <h2>Config</h2>

    <h3>Base</h3>
    <table>
        <tr>
            <th>Config path</th>
            <td><input v-model="configStore.data.base.configPath"></td>
        </tr>
        <tr>
            <th>Data path</th>
            <td><input v-model="configStore.data.base.dataPath"></td>
        </tr>
        <tr>
            <th>Frontend path</th>
            <td><input v-model="configStore.data.base.frontendPath"></td>
        </tr>
        <tr>
            <th>Port broadcast</th>
            <td><input v-model="configStore.data.base.portBroadcast"></td>
        </tr>
        <tr>
            <th>Port scanner</th>
            <td><input v-model="configStore.data.base.portScanner"></td>
        </tr>
        <tr>
            <th>Port web</th>
            <td><input v-model="configStore.data.base.portWeb"></td>
        </tr>
        <tr>
            <th>Query Size</th>
            <td><input type="number" v-model.number="configStore.data.base.querySize"></td>
        </tr>
        <tr>
            <th>Salt</th>
            <td><input v-model="configStore.data.base.salt"></td>
        </tr>
    </table>
</template>