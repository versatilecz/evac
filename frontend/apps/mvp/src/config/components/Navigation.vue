<script setup lang="ts">
import { ICON as ALARMS_ICON } from '@evac/alarms'
import { CONFIG_ICON, TOOLS_ICON, Config } from '@evac/config'
import { ICON as DEVICES_ICON } from '@evac/devices'
import { Contact, Notification } from '@evac/entities'
import { ICON as LOCATIONS_ICON } from '@evac/locations'
import { ICON as ROOMS_ICON } from '@evac/rooms'
import { ICON as SCANNERS_ICON } from '@evac/scanners'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })
</script>

<template>
  <div class="grid content-center pl-3" data-scope="navigation">
    <Config.Link :icon="LOCATIONS_ICON" :to="{ name: 'config.locations' }">{{ t('locations.config.title') }}</Config.Link>
    <Config.Link :icon="ROOMS_ICON" :to="{ name: 'config.rooms' }">{{ t('rooms.config.title') }}</Config.Link>
    <Config.Link :icon="SCANNERS_ICON" :to="{ name: 'config.scanners' }">{{ t('scanners.config.title') }}</Config.Link>
    <Config.Link :icon="DEVICES_ICON" :to="{ name: 'config.devices' }">{{ t('devices.config.title') }}</Config.Link>
    <Config.Link :icon="ALARMS_ICON" :to="{ name: 'config.alarms' }">{{ t('alarms.config.title') }}</Config.Link>
    <Config.Link :icon="Notification.ICON" :to="{ name: 'config.notifications' }">{{ t('notifications.config.title') }}</Config.Link>
    <Config.Link :icon="Contact.ICON" :to="{ name: 'config.contacts' }">{{ t('contacts.title') }}</Config.Link>
    <Config.Link :icon="TOOLS_ICON" :to="{ name: 'config.tools' }">{{ t('config.tools.title') }}</Config.Link>
    <Config.Link :icon="CONFIG_ICON" :to="{ name: 'config.config' }">{{ t('config.config.title') }}</Config.Link>
  </div>
</template>
