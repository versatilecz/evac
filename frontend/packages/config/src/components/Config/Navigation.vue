<script setup lang="ts">
import { ICON as LOCATIONS_ICON } from '@evac/locations'
import { ICON as ROOMS_ICON } from '@evac/rooms'
import { useI18n } from 'vue-i18n'
import Link from './Link.vue'

const { t } = useI18n({ useScope: 'global' })
</script>

<template>
  <div class="grid content-center pl-3" data-scope="navigation">
    <Link :icon="LOCATIONS_ICON" :to="{ name: 'config.locations' }">{{ t('locations.config.title') }}</Link>
    <Link :icon="ROOMS_ICON" :to="{ name: 'config.rooms' }">{{ t('rooms.config.title') }}</Link>
    <Link icon="infrared" :to="{ name: 'config.scanners' }">{{ t('config.scanners.title') }}</Link>
    <Link icon="devices_wearables" :to="{ name: 'config.devices' }">{{ t('config.devices.title') }}</Link>
    <Link icon="detector_alarm" :to="{ name: 'config.alarms' }">{{ t('config.alarms.title') }}</Link>
    <Link icon="mail" :to="{ name: 'config.emails' }">{{ t('config.emails.title') }}</Link>
    <Link icon="construction" :to="{ name: 'config.tools' }">{{ t('config.tools.title') }}</Link>
    <Link icon="settings" :to="{ name: 'config.config' }">{{ t('config.config.title') }}</Link>
  </div>
</template>
