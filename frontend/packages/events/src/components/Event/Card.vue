<script setup lang="ts">
import { useEvent } from '@/composables'
import type { $Event } from '@/definitions'
import IconByKind from './IconByKind.vue'

const props = defineProps<{ event: $Event }>()
const { device, kindLabel } = useEvent(() => props.event.uuid)
</script>

<template>
  <button type="button" class="btn btn-filled btn-accent-blue p-3 h-auto rounded-md shadow-md grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-0 justify-items-start items-center">
    <IconByKind class="size-6 mx-3 row-span-2" :kind="event.kind" />
    <figcaption class="col-start-2 value">{{ kindLabel }}</figcaption>
    <span class="col-start-2 text-sm">{{ device?.name }}</span>
  </button>
</template>
