<script setup>
import { useAlarmStore } from '@/stores/alarmStore'
import { ref } from 'vue'
const alarmStore = useAlarmStore()
const new_alarm = ref({})
</script>

<template>
  <h2>Alarms</h2>
  <table>
    <thead>
      <tr>
        <th>Uuid</th>
        <th>Název</th>
        <th>Předmět</th>
        <th>Text</th>
        <th>Html</th>
        <th>Buzzer</th>
        <th>Led</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="alarm of Object.values(alarmStore.data)" :key="alarm.uuid">
        <td>{{ alarm.uuid }}</td>
        <td><input v-model="alarm.name" /></td>
        <td><input v-model="alarm.subject" /></td>
        <td><textarea v-model="alarm.text" /></td>
        <td><textarea v-model="alarm.html" /></td>
        <td>
          <input v-model="alarm.buzzer" type="checkbox" />
        </td>
        <td>
          <input v-model="alarm.led" type="checkbox" />
        </td>
        <td>
          <input type="submit" value="Save" @click="alarmStore.save(alarm)" />
          <input type="submit" value="Remove" @click="alarmStore.remove(alarm.uuid)" />
        </td>
      </tr>
    </tbody>
  </table>

  <table>
    <tr>
      <th>Název</th>
      <td><input v-model="new_alarm.name" /></td>
    </tr>
    <tr>
      <th>Předmět</th>
      <td><input v-model="new_alarm.subject" /></td>
    </tr>
    <tr>
      <th>Text</th>
      <td><textarea v-model="new_alarm.text" /></td>
    </tr>
    <tr>
      <th>Html</th>
      <td><textarea v-model="new_alarm.html" /></td>
    </tr>
    <tr>
      <th>Buzzer</th>
      <td>
        <input v-model="new_alarm.buzzer" type="checkbox" />
      </td>
    </tr>
    <tr>
      <th>Led</th>
      <td>
        <input v-model="new_alarm.led" type="checkbox" />
      </td>
    </tr>
  </table>
  <button @click="alarmStore.create(new_alarm.name, new_alarm.subject, new_alarm.text, new_alarm.html, new_alarm.buzzer, new_alarm.led)">Vytvořit</button>
</template>

<style scoped>
table {
  width: 100%;
}
</style>
