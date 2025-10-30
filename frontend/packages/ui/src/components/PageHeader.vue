<script setup lang="ts">
import Icon from './Icon.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })
</script>

<template>
  <header class="px-6 flex items-center justify-between row-start-1">
    <h1 class="text-2xl font-black">EVAC</h1>

    <nav class="flex gap-4 items-center justify-end">
      <slot name="nav" />

      <RouterLink v-slot="{ isActive, navigate }" :to="{ name: 'config.index' }" custom>
        <button class="btn btn-filled" :class="{ hidden: isActive }" @click="navigate">
          <Icon icon="settings" />
          <span>{{ t('page.configuration') }}</span>
        </button>
      </RouterLink>
      <RouterLink v-slot="{ isActive, navigate }" :to="{ name: 'dashboard' }" custom>
        <button class="btn btn-filled" :class="{ hidden: isActive }" @click="navigate">
          <Icon icon="frame_person" />
          <span>{{ t('page.overview') }}</span>
        </button>
      </RouterLink>
    </nav>
  </header>
</template>
