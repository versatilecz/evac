import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import * as z from 'zod'

const WithUuid = z.object({
  uuid: z.uuid(),
})

export function useEntityUuid(entity: MaybeRefOrGetter<unknown | null | undefined>) {
  const validationResult = computed(() => WithUuid.safeParse(toValue(entity)))
  const hasUuid = computed(() => validationResult.value.success)
  const uuid = computed(() => (validationResult.value.success ? validationResult.value.data.uuid : null))

  return {
    hasUuid,
    uuid,
  }
}
