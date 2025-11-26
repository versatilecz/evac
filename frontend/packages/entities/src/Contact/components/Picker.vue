<script setup lang="ts">
import { Icon, Listbox } from '@evac/ui'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import * as def from '../definitions'
import { useState } from '../composables'
import Label from './Label.vue'

const modelValue = defineModel<Set<def.Detail['uuid']>>()
const { t } = useI18n({ useScope: 'global' })
const search = ref('')
const { list: contacts } = useState({ filter: { name: search, kind: search } })
const value = computed({
  get: () => [...(modelValue.value ?? [])],
  set: (next: def.Detail['uuid'][]) => {
    modelValue.value = new Set(next)
  },
})
</script>

<template>
  <Listbox.Root v-model="value" class="grid gap-3" multiple>
    <Listbox.Filter :placeholder="t('contact.search', '')" as-child>
      <span class="input flex pr-0">
        <input v-model="search" type="text" class="grow bg-transparent" :placeholder="t('contact.search', '')" />
        <button v-show="search" type="button" class="btn text-primary" @click="search = ''">
          <Icon icon="close" />
        </button>
      </span>
    </Listbox.Filter>
    <Listbox.Content class="flex flex-wrap gap-3">
      <template v-for="contact of contacts" :key="contact.uuid">
        <Listbox.Item :value="contact.uuid" as-child>
          <Label class="btn btn-surface data-[state=checked]:btn-accent-blue" :contact="contact" />
        </Listbox.Item>
      </template>
    </Listbox.Content>
  </Listbox.Root>
</template>
