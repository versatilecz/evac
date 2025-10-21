import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useLocations } from './list'

export function useLocation(uuid: MaybeRefOrGetter<string>) {
  const { data } = useLocations()
  const location = computed(() => data.value.get(toValue(uuid)) ?? null)

  return {
    location,
  }
}
