<script setup>
import { useMainStore } from '@/stores/mainStore';
const mainStore = useMainStore()

console.log(mainStore.backups);
</script>
<template>
    <div>
        <h2>Nástroje</h2>
        <button v-on:click="mainStore.send('Alarm', true)">Alarm on</button>
        <button v-on:click="mainStore.send('Alarm', false)">Alarm off</button>
    </div>

    <div>
        <input v-model="path">
        <button v-on:click="mainStore.send('Backup', path)">Backup</button>
    </div>

    <div>
        <ul>
            <li v-for="backup of Object.values(mainStore.backups)" :key="backup">
                {{ backup }}

                <button v-on:click="mainStore.send('Restore', backup)">Restore</button>

                <button v-on:click="mainStore.send('BackupRemove', backup)">Remove</button>
            </li>
        </ul>
    </div>
</template>