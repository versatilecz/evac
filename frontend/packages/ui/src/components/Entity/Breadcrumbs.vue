<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  location?: string | null | undefined
  room?: string | null | undefined
  scanner?: string | null | undefined
  device?: string | null | undefined
}>()

const delimiter = ' / '

const path = computed(() => {
  let parts = []
  if (props.location) parts.push(props.location)
  if (props.room) parts.push(props.room)
  if (props.scanner) parts.push(props.scanner)
  if (props.device) parts.push(props.device)
  return parts
})

const full = computed(() => path.value.join(delimiter))
const rest = computed(() => path.value.slice(0, -1).join(delimiter))
const last = computed(() => path.value.at(-1) || '')
</script>

<template>
  <slot :full="full" :rest="rest" :last="last" :delimiter="delimiter" />
</template>
