<script setup lang="ts">
const modelValue = defineModel<boolean>()
</script>

<template>
  <figure>
    <input type="checkbox" :checked="modelValue" @change="modelValue = ($event.target as HTMLInputElement)?.checked ?? false" />
  </figure>
</template>
