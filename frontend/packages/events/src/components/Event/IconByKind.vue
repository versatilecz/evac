<script setup lang="ts">
import { Icon } from '@evac/ui'
import { ICON_BY_KIND, type $Event } from '@/definitions'

defineProps<{ kind: $Event['kind'] }>()
</script>

<template>
  <Icon :icon="ICON_BY_KIND[kind]" />
</template>
