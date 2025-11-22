<script setup lang="ts">
import { Icon, Select } from '@evac/ui'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import * as def from '../definitions'
import { useState } from '../composables'
import Label from './Label.vue'

const modelValue = defineModel<def.Detail | null | undefined>()
const { t } = useI18n({ useScope: 'global' })
const { list: contacts } = useState()
const value = computed({
  get: () => modelValue.value ?? null,
  set: (value: def.Detail | null) => {
    modelValue.value = value ?? null
  },
})
</script>

<template>
  <Select.Root v-model="value">
    <Select.Trigger class="input cursor-pointer" :aria-label="t('contact.placeholder')">
      <Select.Value as-child :placeholder="t('contact.placeholder')">
        <Label v-if="value" :contact="value" />
      </Select.Value>
      <Select.Icon as-child>
        <Icon icon="keyboard_arrow_down" />
      </Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content class="input p-0 h-auto bg-surface-elevated shadow-lg" position="popper" align="center" side="bottom">
        <Select.ScrollUpButton>
          <Icon icon="keyboard_arrow_up" />
        </Select.ScrollUpButton>

        <Select.Viewport>
          <template v-for="contact of contacts" :key="contact.uuid">
            <Select.Item
              :value="contact"
              class="flex gap-3 items-center px-3 py-2 hover:bg-emphasis-2 cursor-pointer first:rounded-t-(--input-corner-radius) last:rounded-b-(--input-corner-radius) data-[highlighted]:outline-none data-[highlighted]:bg-accent-blue"
            >
              <Select.ItemText><Label :contact="contact" /></Select.ItemText>
              <Select.ItemIndicator>
                <Icon icon="check" />
              </Select.ItemIndicator>
            </Select.Item>
          </template>
        </Select.Viewport>

        <Select.ScrollDownButton>
          <Icon icon="keyboard_arrow_down" />
        </Select.ScrollDownButton>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
</template>
