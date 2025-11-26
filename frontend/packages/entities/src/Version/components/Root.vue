<script setup lang="ts">
import { useState } from '../composables'
const { state } = useState()
</script>

<template>
  <slot :state="state" />
</template>
