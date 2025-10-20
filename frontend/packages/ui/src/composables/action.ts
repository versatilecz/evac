import { logger } from '@evac/shared'
import { computed, ref } from 'vue'

export function useAction<T extends (...args: any[]) => any>(fn: T) {
  const ongoing = ref(false)
  const error = ref<Error | null>(null)

  function submit(...args: Parameters<T>) {
    ongoing.value = true
    error.value = null
    return Promise.resolve(fn(...args))
      .catch((e) => {
        logger.error(e)
        error.value = e
      })
      .finally(() => {
        ongoing.value = false
      })
  }

  return {
    ongoing: computed(() => ongoing.value),
    error: computed(() => error.value),
    submit,
  }
}
