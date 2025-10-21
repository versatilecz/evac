<script setup lang="ts">
import { Badge, ContentHeader } from '@evac/ui'
import { DEFAULT_SORT, $Scanner, Scanner, useScanners } from '@evac/scanners'
import { changeSortRule } from '@evac/shared'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })
let sort = ref(DEFAULT_SORT)
const { count, list: scanners } = useScanners({ sort })

function assignSort(key: keyof $Scanner) {
  sort.value = changeSortRule(sort.value, key)
}
</script>

<template>
  <ContentHeader :description="t('scanners.config.description', '')">
    <template #title>
      <h1 class="headline">{{ t('scanners.config.title') }}</h1>
      <Badge>{{ count }}</Badge>
      <span class="grow" />
    </template>
  </ContentHeader>
  <Scanner.List class="pb-12" :scanners="scanners" @update:sort="assignSort" />
</template>
