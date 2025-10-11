<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <slot name="pre" />
  <main class="row-start-2 col-start-2 @container/main rounded-page bg-surface-elevated shadow-md overflow-x-hidden overflow-y-auto" v-bind="$attrs">
    <slot />
  </main>
  <slot name="post" />
</template>
