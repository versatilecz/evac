<script setup lang="ts">
import Icon from './Icon.vue'

defineProps<{
  value: boolean | null | undefined
}>()
</script>

<template>
  <Icon v-if="value === true" class="fill-accent-green" icon="check" />
  <Icon v-else-if="value === false" class="fill-accent-red" icon="close" />
</template>
