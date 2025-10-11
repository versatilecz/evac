<script setup>
import { ref } from 'vue'
import { useMainStore } from '@/stores/mainStore'

import { useLocationStore } from '@/stores/locationStore'
import { useRoomStore } from '@/stores/roomStore'
import { useScannerStore } from '@/stores/scannerStore'
import { useDeviceStore } from '@/stores/deviceStore'
import { useEventStore } from '@/stores/eventStore'
import { useActivityStore } from '@/stores/activityStore'
import AlarmSelect from '@/component/AlarmSelect.vue'
import { useEmailStore } from '@/stores/emailStore'

const mainStore = useMainStore()
const locationStore = useLocationStore()
const roomStore = useRoomStore()
const scannerStore = useScannerStore()
const deviceStore = useDeviceStore()
const eventStore = useEventStore()
const activityStore = useActivityStore()
const emailStore = useEmailStore()

const newAlarm = ref({
  device: '',
  scanner: '',
  room: '',
  location: '',
  alarm: {},
})

function getLocationDevices(room) {
  const scanners = Object.values(scannerStore.data)
  const result = Object.values(activityStore.data)
    .filter((activity) => {
      return scanners.some((scanner) => {
        return scanner.room == room && scanner.uuid == activity.scanner
      })
    })
    .map((activity) => {
      return {
        uuid: deviceStore.data[activity.device].uuid,
        name: deviceStore.data[activity.device].name,
        rssi: activity.rssi,
      }
    })

  return result
}

function getUnlocatedDevices() {
  return Object.values(deviceStore.data).filter((device) => !(device.uuid in activityStore.data) && device.enabled)
}
</script>

<template>
  <h2>Přehled zařízení</h2>
  <div class="container">
    <div class="location-wrap">
      <div v-for="location of Object.values(locationStore.data)" :key="location.uuid" class="location">
        <strong>{{ location.name }}</strong>
        <div class="room-wrap">
          <div v-for="room of Object.values(roomStore.data).filter((room) => room.location == location.uuid)" :key="room.uuid" class="room">
            <strong>{{ room.name }}</strong>
            <ul>
              <li v-for="position in getLocationDevices(room.uuid)" :key="position.uuid" class="position">{{ position.name }}&nbsp;({{ position.rssi }})</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="room">
        <strong>Mimo systém</strong>
        <ul>
          <li v-for="position in getUnlocatedDevices()" :key="position.uuid" class="position">
            {{ position.name }}
          </li>
        </ul>
      </div>
    </div>

    <div v-if="mainStore.activeAlarm !== null" class="box">
      <h3>Aktiví alarm</h3>

      <h4>Odeslat email</h4>
      <select v-model="sendEmail">
        <option v-for="email in Object.values(emailStore.data)" :key="email.uuid" :value="email">
          {{ email.name }}
        </option>
      </select>
      <input
        type="submit"
        value="Odeslat"
        @click="
          mainStore.send('Email', {
            subject: sendEmail.subject,
            text: sendEmail.text,
            html: sendEmail.html,
          })
        "
      />

      <br />
      <br />
      <hr />
      <br />

      <h4>Detail alarmu</h4>
      <table>
        <tr>
          <th>Zařízení</th>
          <td>{{ mainStore.activeAlarm.device }}</td>
        </tr>
        <tr>
          <th>Skener</th>
          <td>{{ mainStore.activeAlarm.scanner }}</td>
        </tr>
        <tr>
          <th>Místnost</th>
          <td>{{ mainStore.activeAlarm.room }}</td>
        </tr>
        <tr>
          <th>Lokace</th>
          <td>{{ mainStore.activeAlarm.location }}</td>
        </tr>
        <tr>
          <th>Led</th>
          <td>{{ mainStore.activeAlarm.led }}</td>
        </tr>
        <tr>
          <th>Buzzer</th>
          <td>{{ mainStore.activeAlarm.buzzer }}</td>
        </tr>
        <tr>
          <th>Text</th>
          <td>
            {{
              mainStore.activeAlarm.html
                .replace('%device%', mainStore.activeAlarm.device)
                .replace('%scanner%', mainStore.activeAlarm.scanner)
                .replace('%room%', mainStore.activeAlarm.room)
                .replace('%location%', mainStore.activeAlarm.location)
            }}
          </td>
        </tr>
      </table>
      <button
        @click="
          () => {
            mainStore.send('AlarmStop', true)
          }
        "
      >
        Alarm stop
      </button>
    </div>

    <div class="box">
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
            <button
              v-if="event.alarm"
              @click="
                mainStore.alarm(
                  deviceStore.name(event.device),
                  scannerStore.name(event.scanner),
                  scannerStore.location(event.scanner),
                  scannerStore.room(event.scanner),
                  event.alarm.subject,
                  event.alarm.html,
                  event.alarm.text,
                  event.alarm.buzzer,
                  event.alarm.led
                )
              "
            >
              Spustit
            </button>
          </td>
          <td>
            <button @click="mainStore.send('EventRemove', event.uuid)">Smazat</button>
          </td>
        </tr>
      </table>
    </div>
  </div>

  <div class="box">
    <h3>Novy alarm</h3>
    <table>
      <tr>
        <th>Zařízení</th>
        <td>
          <select v-model="newAlarm.device">
            <option v-for="device in Object.values(deviceStore.data).filter((d) => d.enabled)" :key="device.uuid" :value="device.name">
              {{ device.name }}
            </option>
            <option :value="newAlarm.device">
              {{ newAlarm.device }}
            </option>
          </select>
        </td>
        <td>
          <input v-model="newAlarm.device" />
        </td>
      </tr>
      <tr>
        <th>Skener</th>
        <td>
          <select v-model="newAlarm.scanner">
            <option v-for="scanner in Object.values(scannerStore.data)" :key="scanner.uuid" :value="scanner.name">
              {{ scanner.name }}
            </option>
            <option :value="newAlarm.scanner">
              {{ newAlarm.scanner }}
            </option>
          </select>
        </td>
        <td>
          <input v-model="newAlarm.scanner" />
        </td>
      </tr>
      <tr>
        <th>Místnost</th>
        <td>
          <select v-model="newAlarm.room">
            <option v-for="room in Object.values(roomStore.data)" :key="room.uuid" :value="room.name">
              {{ room.name }}
            </option>
            <option :value="newAlarm.room">
              {{ newAlarm.room }}
            </option>
          </select>
        </td>
        <td>
          <input v-model="newAlarm.room" />
        </td>
      </tr>
      <tr>
        <th>Lokace</th>
        <td>
          <select v-model="newAlarm.location">
            <option v-for="location in Object.values(locationStore.data)" :key="location.uuid" :value="location.name">
              {{ location.name }}
            </option>
            <option :value="newAlarm.location">
              {{ newAlarm.location }}
            </option>
          </select>
        </td>
        <td>
          <input v-model="newAlarm.location" />
        </td>
      </tr>
      <tr>
        <th>Alarm</th>
        <td><AlarmSelect v-model="newAlarm.alarm"></AlarmSelect></td>
      </tr>
    </table>
    <button
      @click="
        mainStore.alarm(
          newAlarm.device,
          newAlarm.scanner,
          newAlarm.location,
          newAlarm.room,
          newAlarm.alarm.subject,
          newAlarm.alarm.html,
          newAlarm.alarm.text,
          newAlarm.alarm.buzzer,
          newAlarm.alarm.led
        )
      "
    >
      Spustit
    </button>
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
.room:hover {
  background: var(--color-border-hover);
}

.device {
  font-weight: bold;
  font-size: large;
}

.box {
  background: var(--color-border);
  display: flexbox;
  width: 50%;
  border-radius: 10px;
  padding: 10px;
  margin: 10px;
}
</style>
