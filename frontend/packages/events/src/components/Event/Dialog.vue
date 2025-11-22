<script setup lang="ts">
import { ContentHeader, Dialog, Entity, Icon, useFormat } from '@evac/ui'
import { useI18n } from 'vue-i18n'
import { ICON, $Event } from '@/definitions'
import { useEvent } from '@/composables';

const props = defineProps<{ event: $Event }>()
defineOptions({ inheritAttrs: false })
const { t } = useI18n({ useScope: 'global' })
const formatter = useFormat()
const { device, scanner, room, location, kindLabel, remove } = useEvent(() => props.event.uuid)


function confirmAndRemove(cb?: () => any) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      if (!confirm(t('event.dialog.confirmDelete', ''))) {
        resolve()
        return
      }
      remove.submit()
        .then(() => (cb ? cb() : void 0))
        .then(resolve)
    })
  })
}
</script>

<template>
  <Dialog.Root v-slot="{ close }">
    <Dialog.Trigger as-child>
      <slot />
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay class="overlay" />
      <Dialog.Content class="dialog" as="form">
        <ContentHeader :icon="ICON">
          <template #title>
            <Dialog.Title class="headline grow"> {{ kindLabel }}</Dialog.Title>
          </template>
          <template #description>
            <Dialog.Description class="description">{{ t('device.dialog.description', '') }}</Dialog.Description>
          </template>
          <template #row>
            <Entity.UuidBadge :entity="event" />
          </template>
        </ContentHeader>

        <Entity.Breadcrumbs v-slot="{ delimiter, rest, last }" :location="location?.name" :room="room?.name" :scanner="scanner?.name" :device="device?.name">
          <p class="px-6 text-center">
            <template v-if="rest.length">{{ rest + delimiter }}</template>
            <strong>{{ last }}</strong>
          </p>
        </Entity.Breadcrumbs>

        <p class="px-6 mt-4 text-center">{{ formatter.dateTime.format(event.timestamp) }}</p>

        <div class="flex gap-4 justify-between p-6">
          <button class="btn text-accent-red" type="button" @click="confirmAndRemove(close)">
            <Icon icon="delete" />
            {{ t('action.delete') }}
          </button>

          <button class="btn" type="button" @click="close()">
            <Icon icon="close" />
            {{ t('action.close') }}
          </button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</template>
