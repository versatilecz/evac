<script setup lang="ts" generic="T extends { uuid: string, name: string }">
import { Select } from 'reka-ui/namespaced'
import { useI18n } from 'vue-i18n'
import { useSelect } from '../composables/select'
import Icon from './Icon.vue'

const props = defineProps<{
  state: Map<T['uuid'], T>
  options: T[]
}>()
const modelValue = defineModel<T['uuid'] | null | undefined>()
defineOptions({ inheritAttrs: false })

const { t } = useI18n({ useScope: 'global' })
const { detail } = useSelect({ modelValue, state: () => props.state })
</script>

<template>
  <Select.Root v-model="detail">
    <Select.Trigger class="input cursor-pointer justify-between" :aria-label="t('location.select.placeholder')" v-bind="$attrs">
      <Select.Value :placeholder="t('location.select.placeholder')" />
      <Select.Icon as-child>
        <Icon icon="keyboard_arrow_down" />
      </Select.Icon>
    </Select.Trigger>
    <Select.Content class="input p-0 h-auto bg-surface-elevated shadow-lg z-50" position="popper" align="center" side="bottom">
      <Select.ScrollUpButton>
        <Icon icon="keyboard_arrow_up" />
      </Select.ScrollUpButton>

      <Select.Viewport>
        <template v-for="option of options" :key="option.uuid">
          <Select.Item
            :value="option"
            class="flex gap-3 items-center px-3 py-2 hover:bg-emphasis-2 cursor-pointer first:rounded-t-(--input-corner-radius) last:rounded-b-(--input-corner-radius) data-highlighted:outline-none data-highlighted:bg-accent-blue"
          >
            <Select.ItemText>
              <slot name="option" :option="option">
                {{ option.name }}
              </slot>
            </Select.ItemText>
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
