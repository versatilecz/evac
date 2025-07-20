<script setup>
import { useMainStore } from '@/stores/mainStore';

import { useLocationStore } from '@/stores/locationStore'
import { useRoomStore } from '@/stores/roomStore'
import { useScannerStore } from '@/stores/scannerStore'
import { useDeviceStore } from '@/stores/deviceStore'
import { useEventStore } from '@/stores/eventStore'
import { useActivityStore } from '@/stores/activityStore'
import AlarmSelect from '@/component/AlarmSelect.vue';

const mainStore = useMainStore()
const locationStore = useLocationStore()
const roomStore = useRoomStore()
const scannerStore = useScannerStore()
const deviceStore = useDeviceStore()
const eventStore = useEventStore()
const activityStore = useActivityStore()



function getLocationDevices(room) {
    const scanners = Object.values(scannerStore.data)
    const result =
    Object.values(activityStore.data).filter(activity => {
        return scanners.some(scanner => {
            return scanner.room == room && scanner.uuid == activity.scanner
        })
    }).map(activity => {
        return {
            uuid: deviceStore.data[activity.device].uuid,
            name: deviceStore.data[activity.device].name,
            rssi: activity.rssi,
        }
    })

    return result

}

function getUnlocatedDevices() {
    return Object.values(deviceStore.data).filter(device => !(device.uuid in activityStore.data) && device.enabled)
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
                            <li class="position" v-for="position in getLocationDevices(room.uuid) " :key="position.uuid">{{ position.name }}&nbsp;({{ position.rssi }})</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="room">
                <strong>Mimo systém</strong>
                <ul>
                    <li class="position" v-for="position in getUnlocatedDevices() " :key="position.uuid">{{ position.name }}</li>
                </ul>
            </div>
        </div>

        <div v-if="mainStore.activeAlarm !== null">
            <h3>Alarm</h3>
            <button v-on:click="() => {mainStore.send('AlarmStop', true)}">Alarm stop</button>
        </div>

        <div>
            <h3>Události</h3>
            <table>
                <tr>
                    <th>Zařízeni</th>
                    <th>Událost</th>
                    <th>Scanner</th>
                    <th>Místnost</th>
                    <th>Lokace</th>
                    <th>Alarm</th>
                    <th>Smazat</th>
                </tr>
                <tr v-for="event in Object.values(eventStore.data)" :key="event.device">
                    <td>{{ deviceStore.name(event.device) }}</td>
                    <td>{{ event.kind }}</td>
                    <td>{{ scannerStore.name(event.scanner) }}</td>
                    <td>{{ scannerStore.room(event.scanner) }}</td>
                    <td>{{ scannerStore.location(event.scanner) }}</td>
                    <td>
                        <AlarmSelect v-model="event.alarm"></AlarmSelect>
                        <button v-if="event.alarm" v-on:click="mainStore.alarm(
                            deviceStore.name(event.device),
                            scannerStore.name(event.scanner),
                            scannerStore.location(event.scanner),
                            scannerStore.room(event.scanner),
                            event.alarm.subject,
                            event.alarm.html,
                            event.alarm.text,
                            event.alarm.buzzer,
                            event.alarm.led)">Spustit</button>
                    </td>
                    <td>
                        <button v-on:click="mainStore.send('EventRemove', event.uuid)">Smazat</button>
                    </td>
                </tr>
            </table>
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