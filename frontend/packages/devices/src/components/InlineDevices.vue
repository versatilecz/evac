<script setup lang="ts">
import type { $Device } from '../definitions'

const { devices = [] } = defineProps<{ devices?: $Device[] }>()
</script>

<template>
  <figure class="flex gap-4 flex-wrap items-center" data-scope="devices">
    <template v-for="device of devices" :key="device.uuid">
      <slot :device="device" />
    </template>
  </figure>
</template>
