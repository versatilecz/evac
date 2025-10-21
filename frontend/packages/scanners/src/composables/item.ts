import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useScanners } from './list'

export function useScanner(uuid: MaybeRefOrGetter<string>) {
  const { data } = useScanners()
  const scanner = computed(() => data.value.get(toValue(uuid)) ?? null)

  return {
    scanner,
  }
}
