import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useEmails } from './list'
import type { $Email } from '@/definitions'

export function useEmail(uuid: MaybeRefOrGetter<$Email['uuid']>) {
  const { data } = useEmails()
  const email = computed(() => data.value.get(toValue(uuid)) ?? null)

  return {
    email,
  }
}
