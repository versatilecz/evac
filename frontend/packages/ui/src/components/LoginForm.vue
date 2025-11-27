<script setup lang="ts">
import * as Auth from '@evac/auth'
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from './Icon.vue'

const { t } = useI18n({ useScope: 'global' })
const formData = reactive<Auth.LoginCredentials>(seed())

function handleSubmit() {
  Auth.service.userInfo.login(formData)
  reset()
}

function reset() {
  Object.assign(formData, seed())
}

function seed(): Auth.LoginCredentials {
  return {
    username: '',
    password: '',
  }
}
</script>

<template>
  <form class="grid gap-6" @submit.prevent="handleSubmit">
    <label class="label" for="login-username">
      <span class="label-text">{{ t('auth.username') }}</span>
      <input id="login-username" v-model="formData.username" type="text" autocomplete="username" class="input w-full" required :placeholder="t('auth.username')" />
    </label>

    <label class="label" for="login-password">
      <span class="label-text">{{ t('auth.password') }}</span>
      <input id="login-password" v-model="formData.password" type="password" autocomplete="current-password" class="input w-full" required :placeholder="t('auth.password')" />
    </label>

    <button type="submit" class="btn btn-filled w-full"><Icon icon="login" /> {{ t('auth.login') }}</button>
  </form>
</template>
