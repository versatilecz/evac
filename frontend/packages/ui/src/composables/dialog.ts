import { isDeepEqual } from 'remeda'
import type { ZodType } from 'zod'
import { computed, reactive, toValue, watch, type ComputedRef, type MaybeRefOrGetter, type Reactive } from 'vue'
import { useI18n, type ComposerTranslation } from 'vue-i18n'

type DialogFormOptions<Tc extends object, Tu extends object = Tc> = {
  data: MaybeRefOrGetter<Tc | Tu | null | undefined>
  seed: () => Promise<Tc> | Tc
  type: {
    create: ZodType<Tc>
    update: ZodType<Tu>
  }
}

type DialogFormState = {
  hasData: ComputedRef<boolean>
  hasChanges: ComputedRef<boolean>
}
type DialogForm<Tc extends object, Tu extends object = Tc> = DialogFormState & {
  formData: Reactive<Tc | Tu>
  isValid: ComputedRef<boolean>
  isCreate(input: Tc | Tu | null | undefined): input is Tc
  isUpdate(input: Tc | Tu | null | undefined): input is Tu
  reset(): void
}

export function useDialogForm<Tc extends object, Tu extends object = Tc>(options: DialogFormOptions<Tc, Tu>): DialogForm<Tc | Tu> {
  const input = computed(() => toValue(options.data))
  const formData = reactive<Tc | Tu>({} as Tc | Tu)
  watch(input, (current) => Object.assign(formData, current ?? options.seed()), { immediate: true })

  const hasData = computed(() => !!input.value)
  const hasChanges = computed(() => {
    const originalData = toValue(options.data)
    if (!originalData) return false
    const currentData = { ...formData } as Tc | Tu

    return !isDeepEqual(currentData, originalData)
  })

  return {
    formData,
    hasData,
    hasChanges,
    isCreate,
    isUpdate,
    isValid: options.type ? computed(() => options.type.create.safeParse(formData).success) : computed(() => true),
    reset,
  } satisfies DialogForm<Tc | Tu>

  function reset() {
    Object.assign(formData, options.seed(), { ...toValue(options.data) } as Tc | Tu)
  }

  function isCreate(input: Tc | Tu | null | undefined): input is Tc {
    return options.type.create.safeParse(input).success
  }

  function isUpdate(input: Tc | Tu | null | undefined): input is Tu {
    return options.type.update.safeParse(input).success
  }
}

type DialogTitleKeys = [title: string, create: string, edit: string]

export function useDialogTitle(state: DialogFormState, keys: DialogTitleKeys, t: ComposerTranslation = useI18n({ useScope: 'global' }).t) {
  return computed(() => {
    if (!state.hasData.value) return t(keys[1])
    return state.hasChanges.value ? t(keys[2]) : t(keys[0])
  })
}
