<script setup lang="ts">
import Icon from './Icon.vue'

defineProps<{
  title?: string
  description?: string
  icon?: string
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
      <div v-if="!!$slots.title || title || icon" class="flex gap-4 items-center h-12">
        <template v-if="icon">
          <Icon class="size-8" :icon="icon" />
        </template>
        <slot name="title">
          <h1 class="headline">{{ title }}</h1>
        </slot>
      </div>
      <div v-if="!!$slots.description || description" class="mt-3">
        <slot name="description">
          <p class="paragraph description">{{ description }}</p>
        </slot>
      </div>
    </slot>
  </header>
</template>
