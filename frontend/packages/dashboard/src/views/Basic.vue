<script setup lang="ts">
import { ActiveAlarm } from '@evac/alarms'
import { Device } from '@evac/devices'
import { Version } from '@evac/entities'
import { Event, useEvents } from '@evac/events'
import { PageContainer, PageLayout } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { DebugActions, SimpleDevicesOverview } from '@/components'
import { useHighlightedDevice } from '@/composables'

const { t } = useI18n({ useScope: 'global' })
const { list: events } = useEvents()

const { highlightedDevice, highlightDevice } = useHighlightedDevice()
</script>

<template>
  <PageLayout>
    <template #nav>
      <DebugActions />
    </template>
    <ActiveAlarm.Root v-slot="{ activeAlarm, isAlarm }">
      <PageContainer class="py-6 px-4 gap-8 flex" :class="{ 'border-4 border-accent-red': isAlarm }">
        <!-- Device Overview Section -->
        <SimpleDevicesOverview class="grid gap-0 content-start grow">
          <template #device="{ device, room }">
            <Device.Badge
              :class="{
                'badge-accent-blue': room && highlightedDevice !== device.uuid,
                'badge-accent-orange': highlightedDevice === device.uuid,
              }"
              :device="device"
              @mouseover="() => highlightDevice(device.uuid)"
              @mouseout="() => highlightDevice(null)"
            />
          </template>
        </SimpleDevicesOverview>

        <!-- Events Section -->
        <section v-if="events.length || activeAlarm" class="first:pt-4 flex flex-col gap-4 content-start">
          <h2 class="headline px-2 pt-4">{{ t('events.title') }}</h2>
          <Event.Cards class="grow grid gap-2 grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] overflow-y-auto content-start p-2" :events="events">
            <template #event="{ event }">
              <Event.Root v-slot="{ device }" :uuid="event.uuid">
                <Event.Dialog :event="event">
                  <Event.Card
                    :class="{ 'btn-accent-orange': highlightedDevice === event.device }"
                    :event="event"
                    @mouseover="() => highlightDevice(device?.uuid ?? null)"
                    @mouseout="() => highlightDevice(null)"
                  />
                </Event.Dialog>
              </Event.Root>
            </template>
          </Event.Cards>

          <!-- Actions Section -->
          <ActiveAlarm.Message v-if="activeAlarm" class="align-self-end" :alarm-info="activeAlarm">
            <template #actions>
              <ActiveAlarm.Actions :alarm-info="activeAlarm" />
            </template>
          </ActiveAlarm.Message>
        </section>
      </PageContainer>
    </ActiveAlarm.Root>

    <template #footer>
      <Version.Info />
    </template>
  </PageLayout>
</template>
