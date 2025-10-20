<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()

defineSlots<{
  default(): never
  title(): never
  description(): never
}>()
</script>

<template>
  <header class="px-6 pt-8 pb-4" data-scope="content">
    <slot>
      <div v-if="!!$slots.title || title" class="flex gap-4 items-center h-12">
        <slot name="title">
          <h1 class="headline">{{ title }}</h1>
        </slot>
      </div>
      <template v-if="!!$slots.description || description">
        <p class="paragraph description mt-3">
          <slot name="description">{{ description }}</slot>
        </p>
      </template>
    </slot>
  </header>
</template>
