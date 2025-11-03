<script setup lang="ts">
import { useAuth } from '@evac/auth'
import { useDevice } from '@evac/devices'
import { useLocation } from '@evac/locations'
import { useRoom } from '@evac/rooms'
import { useScanner } from '@evac/scanners'
import { Badge, EntityBreadcrumbs } from '@evac/ui'
import type { $Event } from '@/definitions'
import IconByKind from './IconByKind.vue'

const props = defineProps<{ event: $Event }>()
defineOptions({ inheritAttrs: false })
const { isDebug } = useAuth()
const { device } = useDevice(() => props.event.device ?? '')
const { scanner } = useScanner(() => props.event.scanner)
const { room } = useRoom(() => scanner.value?.room ?? '')
const { location } = useLocation(() => room.value?.location ?? '')
</script>

<template>
  <figure class="px-3 py-2 rounded-md shadow-md bg-accent-orange grid grid-cols-[auto_1fr] gap-3 content-center items-center" v-bind="$attrs">
    <IconByKind class="size-6" :kind="event.kind" />

    <div v-if="isDebug" class="flex gap-2 items-center justify-between">
      <figcaption class="value">{{ event.kind }}</figcaption>
      <Badge>{{ event.uuid }}</Badge>
    </div>
    <template v-else>
      <figcaption class="value">{{ event.kind }}</figcaption>
    </template>

    <Badge class="col-span-2 justify-end">
      <EntityBreadcrumbs :location="location?.name" :room="room?.name" :scanner="scanner?.name" :device="device?.name" v-slot="{ delimiter, rest, last }">
        <span class="whitespace-nowrap block px-1 overflow-x-auto">
          <template v-if="rest.length">{{ rest + delimiter }}</template>
          <strong>{{ last }}</strong>
        </span>
      </EntityBreadcrumbs>
    </Badge>

  </figure>
</template>
