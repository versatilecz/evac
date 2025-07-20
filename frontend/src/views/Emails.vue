<script setup>
import { useEmailStore } from '@/stores/emailStore'
import { ref } from 'vue';
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
                <th>Text</th>
                <th>Html</th>
            </tr>
        </thead>

        <tbody>
            <tr v-for="email of Object.values(emailStore.data)" :key="email.uuid">
                <td>{{ email.uuid }}</td>
                <td><input v-model="email.name"></td>
                <td><input v-model="email.subject"></td>
                <td><textarea v-model="email.text"></textarea></td>
                <td><textarea v-model="email.html"></textarea></td>
                <td>
                    <input type="submit" value="Save" v-on:click="emailStore.save(email)">
                    <input type="submit" value="Remove" v-on:click="emailStore.remove(email.uuid)">
                </td>
        </tr>
        </tbody>
    </table>

    <table>
        <tr>
            <th>Název</th>
            <td><input v-model="new_email.name"></td>
        </tr>
        <tr>
            <th>Předmět</th>
            <td><input v-model="new_email.subject"></td>
        </tr>
        <tr>
            <th>Text</th>
            <td><textarea v-model="new_email.text"></textarea></td>
        </tr>
        <tr>
            <th>Html</th>
            <td><textarea v-model="new_email.html"></textarea></td>
        </tr>
    </table>
    <button v-on:click="emailStore.create(new_email.name, new_email.subject, new_email.text, new_email.html)">Vytvořit</button>
</template>



<style scoped>
table {
    width: 100%;
}
</style>