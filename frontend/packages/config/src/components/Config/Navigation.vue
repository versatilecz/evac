<script setup lang="ts">
import { ICON as ALARMS_ICON } from '@evac/alarms'
import { ICON as DEVICES_ICON } from '@evac/devices'
import { ICON as EMAILS_ICON } from '@evac/emails'
import { ICON as LOCATIONS_ICON } from '@evac/locations'
import { ICON as ROOMS_ICON } from '@evac/rooms'
import { ICON as SCANNERS_ICON } from '@evac/scanners'
import { useI18n } from 'vue-i18n'
import { CONFIG_ICON, TOOLS_ICON } from '@/definitions'
import Link from './Link.vue'

const { t } = useI18n({ useScope: 'global' })
</script>

<template>
  <div class="grid content-center pl-3" data-scope="navigation">
    <Link :icon="LOCATIONS_ICON" :to="{ name: 'config.locations' }">{{ t('locations.config.title') }}</Link>
    <Link :icon="ROOMS_ICON" :to="{ name: 'config.rooms' }">{{ t('rooms.config.title') }}</Link>
    <Link :icon="SCANNERS_ICON" :to="{ name: 'config.scanners' }">{{ t('scanners.config.title') }}</Link>
    <Link :icon="DEVICES_ICON" :to="{ name: 'config.devices' }">{{ t('devices.config.title') }}</Link>
    <Link :icon="ALARMS_ICON" :to="{ name: 'config.alarms' }">{{ t('alarms.config.title') }}</Link>
    <Link :icon="EMAILS_ICON" :to="{ name: 'config.emails' }">{{ t('emails.config.title') }}</Link>
    <Link :icon="TOOLS_ICON" :to="{ name: 'config.tools' }">{{ t('config.tools.title') }}</Link>
    <Link :icon="CONFIG_ICON" :to="{ name: 'config.config' }">{{ t('config.config.title') }}</Link>
  </div>
</template>
