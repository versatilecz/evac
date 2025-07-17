<script setup>
import { useMainStore } from '@/stores/mainStore';
const mainStore = useMainStore()

</script>
<template>
    <h2>Nástroje</h2>
    <button v-on:click="mainStore.send('Alarm', true)">Alarm on</button>
    <button v-on:click="mainStore.send('Alarm', false)">Alarm off</button>
</template>