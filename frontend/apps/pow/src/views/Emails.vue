<script setup>
import { useEmailStore } from '@/stores/emailStore'
import { useMainStore } from '@/stores/mainStore'
import { ref } from 'vue'

const mainStore = useMainStore()
const emailStore = useEmailStore()
const new_email = ref({})
</script>

<template>
  <h2>Emails</h2>
  <table>
    <thead>
      <tr>
        <th>Uuid</th>
        <th>Název</th>
        <th>Předmět</th>
        <th>Short</th>
        <th>Long</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="email of Object.values(emailStore.data)" :key="email.uuid">
        <td>{{ email.uuid }}</td>
        <td><input v-model="email.name" /></td>
        <td><input v-model="email.subject" /></td>
        <td><textarea v-model="email.short"></textarea></td>
        <td><textarea v-model="email.long"></textarea></td>
        <td>
          <input type="submit" value="Save" @click="emailStore.save(email)" />
          <input type="submit" value="Remove" @click="emailStore.remove(email.uuid)" />
          <input
            type="submit"
            value="Odeslat"
            @click="
              mainStore.send('Email', {
                subject: email.subject,
                short: email.short,
                long: email.long,
              })
            "
          />
        </td>
      </tr>
    </tbody>
  </table>

  <table>
    <tr>
      <th>Název</th>
      <td><input v-model="new_email.name" /></td>
    </tr>
    <tr>
      <th>Předmět</th>
      <td><input v-model="new_email.subject" /></td>
    </tr>
    <tr>
      <th>Short</th>
      <td><textarea v-model="new_email.short" /></td>
    </tr>
    <tr>
      <th>Long</th>
      <td><textarea v-model="new_email.long" /></td>
    </tr>
  </table>
  <button @click="emailStore.create(new_email.name, new_email.subject, new_email.short, new_email.long)">Vytvořit</button>
</template>

<style scoped>
table {
  width: 100%;
}
</style>
