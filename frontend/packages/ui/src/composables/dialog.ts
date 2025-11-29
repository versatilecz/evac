import { isDeepEqual } from 'remeda'
import type { ZodType } from 'zod'
import { computed, reactive, ref, toValue, watch, type ComputedRef, type MaybeRefOrGetter, type Reactive } from 'vue'
import { useI18n, type ComposerTranslation } from 'vue-i18n'

type DialogFormOptions<Tc extends object, Tu extends object = Tc> = {
  data: MaybeRefOrGetter<Tc | Tu | null | undefined>
  seed?: () => Promise<Tc> | Tc
  type?: {
    create?: ZodType<Tc>
    update?: ZodType<Tu>
  },
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
  set(value: Tc | Tu): void
}

export function useDialogForm<Tc extends object, Tu extends object = Tc>(options: DialogFormOptions<Tc, Tu>): DialogForm<Tc | Tu> {
  const dataWereSet = ref(false)
  const originalData = ref<Tc | Tu | null>(null)

  const input = computed(() => toValue(options.data))
  const formData = reactive<Tc | Tu>({} as Tc | Tu)
  watch(input, async (current) => {
    Object.assign(formData, current ?? (await options.seed?.()))
    originalData.value = { ...current }
  }, { immediate: true })

  const hasData = computed(() => !!input.value || dataWereSet.value)
  const hasChanges = computed(() => {
    if (!originalData.value) return false
    const currentData = { ...formData } as Tc | Tu

    return !isDeepEqual(currentData, originalData.value)
  })

  return {
    formData,
    hasData,
    hasChanges,
    isCreate,
    isUpdate,
    isValid: options.type?.create
      ? computed(() => options.type!.create!.safeParse(formData).success)
      : options.type?.update
        ? computed(() => options.type!.update!.safeParse(formData).success)
        : computed(() => true),
    reset,
    set,
  } satisfies DialogForm<Tc | Tu>

  async function reset() {
    dataWereSet.value = false
    originalData.value = null

    if (!isUpdate(input.value) && options.seed) {
      const seedData = await options.seed()
      Object.assign(formData, seedData)
      return
    }

    Object.assign(formData, { ...toValue(options.data) } as Tc | Tu)
  }

  function set(value: Tc | Tu) {
    Object.assign(formData, value)
    dataWereSet.value = true
    originalData.value = { ...value }
  }

  function isCreate(input: Tc | Tu | null | undefined): input is Tc {
    return options.type?.create?.safeParse(input).success ?? false
  }

  function isUpdate(input: Tc | Tu | null | undefined): input is Tu {
    return options.type?.update?.safeParse(input).success ?? false
  }
}

type DialogTitleKeys = [title: string, create: string, edit: string]

export function useDialogTitle(state: DialogFormState, keys: DialogTitleKeys, t: ComposerTranslation = useI18n({ useScope: 'global' }).t) {
  return computed(() => {
    if (!state.hasData.value) return t(keys[1])
    return state.hasChanges.value ? t(keys[2]) : t(keys[0])
  })
}
