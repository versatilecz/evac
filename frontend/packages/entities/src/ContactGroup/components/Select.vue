<script setup lang="ts">
import { Icon, Select } from '@evac/ui'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import * as def from '../definitions'
import { useState } from '../composables'

defineOptions({ inheritAttrs: false })
const modelValue = defineModel<def.Detail['uuid'] | null | undefined>()
const { t } = useI18n({ useScope: 'global' })
const { data, list: options } = useState()
const value = computed({
  get() {
    const uuid = modelValue.value
    return uuid ? data.value.get(uuid) ?? null : null
  },
  set(value: def.Detail | null) {
    modelValue.value = value?.uuid ?? null
  },
})
</script>

<template>
  <Select.Root v-model="value">
    <Select.Trigger class="input cursor-pointer justify-between" :aria-label="t('contactGroup.placeholder')" v-bind="$attrs">
      <Select.Value :placeholder="t('contactGroup.placeholder')" />
      <Select.Icon as-child>
        <Icon icon="keyboard_arrow_down" />
      </Select.Icon>
    </Select.Trigger>
      <Select.Content class="input p-0 h-auto bg-surface-elevated shadow-lg z-50" position="popper" align="center" side="bottom">
        <Select.ScrollUpButton>
          <Icon icon="keyboard_arrow_up" />
        </Select.ScrollUpButton>

        <Select.Viewport>
          <template v-for="contactGroup of options" :key="contactGroup.uuid">
            <Select.Item
              :value="contactGroup"
              class="flex gap-3 items-center px-3 py-2 hover:bg-emphasis-2 cursor-pointer first:rounded-t-(--input-corner-radius) last:rounded-b-(--input-corner-radius) data-highlighted:outline-none data-highlighted:bg-accent-blue"
            >
              <Select.ItemText v-text="contactGroup.name" />
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
  </Select.Root>
</template>
