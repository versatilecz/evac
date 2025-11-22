<script setup lang="ts">
import { $FilterByReference, useLocations } from '@evac/locations'
import { useRooms } from '@evac/rooms'
import { Device, DevicesRoot, InlineDevices } from '@evac/devices'
import { Badge } from '@evac/ui'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({
  messages: {
    en: {
      devicesOverview: 'Devices Overview',
      unlocatedDevices: 'Unlocated Devices',
    },
    cs: {
      devicesOverview: 'Přehled zařízení',
      unlocatedDevices: 'Mimo systém',
    },
  },
})

const filter = ref($FilterByReference.enum.all)
const { list: locations } = useLocations({ filter: { reference: filter } })
const { byLocation } = useRooms()
</script>

<template>
  <section>
    <header class="pt-4">
      <h1 class="headline px-2">{{ t('devicesOverview') }}</h1>
    </header>

    <div class="list overflow-y-auto p-2">
      <template v-for="location of locations" :key="location.uuid">
        <DevicesRoot v-slot="{ count }" source-type="location" :location="location.uuid">
          <header class="flex gap-4 items-center pt-4 pb-2 first:pt-2">
            <h2 class="headline px-0" v-text="location.name" />
            <Badge>{{ count }}</Badge>
          </header>
        </DevicesRoot>

        <template v-for="room of byLocation.get(location.uuid) ?? []" :key="room.uuid">
          <DevicesRoot v-slot="{ count, devices }" source-type="room" :room="room.uuid">
            <div class="border-t flex gap-4 items-center h-12">
              <h3 class="paragraph font-semibold" v-text="room.name" />
              <Badge>{{ count }}</Badge>
              <InlineDevices v-slot="{ device }" :devices="devices" class="justify-end grow">
                <slot name="device" :device="device" :room="room" :location="location">
                  <Device.Badge :device="device" />
                </slot>
              </InlineDevices>
            </div>
          </DevicesRoot>
        </template>
      </template>
      <DevicesRoot v-slot="{ count, devices }" source-type="unallocated">
        <div class="list mt-2">
          <header class="flex gap-4 items-center pt-4 pb-2 border-b">
            <h2 class="headline px-0 w-max whitespace-nowrap">{{ t('unlocatedDevices') }}</h2>
            <Badge>{{ count }}</Badge>
          </header>
          <InlineDevices v-slot="{ device }" :devices="devices" class="mt-2">
            <slot name="device" :device="device" :room="null" :location="null">
              <Device.Badge :device="device" />
            </slot>
          </InlineDevices>
        </div>
      </DevicesRoot>
    </div>
  </section>
</template>
