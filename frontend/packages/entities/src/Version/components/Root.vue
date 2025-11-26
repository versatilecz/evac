<script setup lang="ts">
import { useState } from '../composables'
const { backend } = useState()
</script>

<template>
  <slot :backend="backend" />
</template>
