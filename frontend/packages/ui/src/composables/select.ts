import { computed, toValue, type MaybeRefOrGetter, type ModelRef } from 'vue'

type UseSelectOptions<T extends { uuid: string }> = {
  modelValue: ModelRef<T['uuid'] | null | undefined>
  state: MaybeRefOrGetter<Map<T['uuid'], T>>
}

export function useSelect<T extends { uuid: string }>({ modelValue, state }: UseSelectOptions<T>) {
  const detail = computed({
    get() {
      const uuid = modelValue.value
      const currentState = toValue(state)
      return uuid ? (currentState.get(uuid) ?? null) : null
    },
    set(value: T | null) {
      modelValue.value = value?.uuid || null
    },
  })

  return { detail }
}
