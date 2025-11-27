<script setup lang="ts">
import * as Auth from '@evac/auth'
import { useI18n } from 'vue-i18n'
import Icon from './Icon.vue'

const { t } = useI18n({ useScope: 'global' })

function logout() {
  Auth.service.userInfo.logout()
}
</script>

<template>
  <button type="button" class="btn btn-filled" @click="logout"><Icon icon="logout" /> {{ t('auth.logout') }}</button>
</template>
