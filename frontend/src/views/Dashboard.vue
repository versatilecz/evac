<script setup>
import { useMainStore } from '@/stores/mainStore';

import { useLocationStore } from '@/stores/locationStore'
import { useRoomStore } from '@/stores/roomStore'
import { useScannerStore } from '@/stores/scannerStore'
import { useDeviceStore } from '@/stores/deviceStore'
import { useEventStore } from '@/stores/eventStore'
import { usePositionStore } from '@/stores/positionStore'

const mainStore = useMainStore()
const locationStore = useLocationStore()
const roomStore = useRoomStore()
const scannerStore = useScannerStore()
const deviceStore = useDeviceStore()
const eventStore = useEventStore()
const positionStore = usePositionStore()



function getLocationDevices(room) {
    const scanners = Object.values(scannerStore.data)
    const result =
    positionStore.data.filter(pos => {
        return scanners.some(scanner => {
            return scanner.room == room && scanner.uuid == pos.scanner
        })
    }).map(position => {
        return {
            uuid: deviceStore.data[position.device].uuid,
            name: deviceStore.data[position.device].name,
            rssi: position.rssi,
        }
    });

    return result

}

function getUnlocatedDevices() {
    return Object.values(deviceStore.data).filter(device => {
        return !positionStore.data.some(position => position.device == device.uuid || !device.enable)
    })

}
</script>

<template>
    <h2>Přehled zařízení</h2>
    <div class="container">
        <div class="location-wrap">
            <div class="location" v-for="location of Object.values(locationStore.data)" :key="location.uuid">
                <strong>{{ location.name }}</strong>
                <div class="room-wrap">

                    <div class="room" v-for="room of Object.values(roomStore.data).filter(room => room.location == location.uuid)" :key="room.uuid">
                        <strong>{{ room.name }}</strong>
                        <ul>
                            <li class="position" v-for="position in getLocationDevices(room.uuid) " :key="position.uuid">{{ position.name }} ({{ position.rssi }})</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="room">
                <strong>Mimo systém</strong>
                <ul>
                    <li class="position" v-for="position in getUnlocatedDevices() " :key="position.uuid">{{ position.name }} ({{ position.rssi }})</li>
                </ul>
            </div>
        </div>

        <div>
            <h3>Události</h3>
            <button v-on:click="() => {eventStore.reset(); mainStore.send('Alarm', false)}">Clear</button>
            <ul>
                <li v-for="event in Object.values(eventStore.data)" :key="event.device">{{ deviceStore.name(event.device) }} {{ event.kind }} <button v-on:click="mainStore.send('Alarm', true)">Alarm</button></li>
            </ul>
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