<script setup>
import { useLocationStore } from '@/stores/locationStore'
import { useRoomStore } from '@/stores/roomStore'
import { useScannerStore } from '@/stores/scannerStore'
import { useDeviceStore } from '@/stores/deviceStore'
import { useEventStore } from '@/stores/eventStore'

const locationStore = useLocationStore()
const roomStore = useRoomStore()
const scannerStore = useScannerStore()
const deviceStore = useDeviceStore()
const eventStore = useEventStore()
</script>

<template>
    <h2>Dashboard</h2>
    <div class="container">
        <div class="location-wrap">
            <div class="location" v-for="location in locationStore.data" :key="location.uuid">
                <strong>{{ location.name }}</strong>
                <h3>Mistnosti</h3>
                <div class="room-wrap">

                    <div class="room" v-for="room in roomStore.data.filter(room => room.location == location.uuid)" :key="room.uuid">
                        <strong>{{ room.name }}</strong>
                        <h4>Zarizeni</h4>
                        <ul>
                            <li class="device" v-for="device in deviceStore.data" :key="device.uuid">{{ device.name }}</li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>

    </div>
</template>

<style scoped>
.location-wrap {
    display: flex;
    flex-grow: inherit;
    flex-flow: row;
}

.location {
    background: var(--color-background-mute);
    border-radius: 10px;
    display: flexbox;
    width: 50%;
    padding: 10px;
    margin: 10px;
}

.room-wrap {
    background: var(--color-background-soft);
    display: flex;
    flex-grow: inherit;
    flex-flow: row;
}

.room {
    background: var(--color-border);
    display: flexbox;
    width: 50%;
    border-radius: 10px;
    padding: 10px;
    margin: 10px;
}
.room:hover{
    background: var(--color-border-hover);
}

.device {
    font-weight: bold;
    font-size: large;
}
</style>