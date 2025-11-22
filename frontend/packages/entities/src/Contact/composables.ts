import { formatCount, logger, sortByRules, unionFilters, type SortRule } from '@evac/shared'
import { useAction, useDialogForm } from '@evac/ui'
import { useObservable } from '@vueuse/rxjs'
import { pipe } from 'remeda'
import { computed, ref, toValue, watch, watchEffect, type MaybeRefOrGetter } from 'vue'
import { useI18n } from 'vue-i18n'

import { state$ } from './data'
import * as def from './definitions'
import { service } from './service'
import { getKind } from './misc'


type FilterOptions = {
  name?: MaybeRefOrGetter<string>
  kind?: MaybeRefOrGetter<string>
}

type Options = {
  filter?: FilterOptions
  sort?: MaybeRefOrGetter<SortRule[]>
}

export function useState({ filter, sort = [def.DEFAULT_SORT] }: Options = {}) {
  const data = useObservable(state$, { onError: logger.error, initialValue: new Map<string, def.Detail>() })
  const all = computed(() => pipe([...data.value.values()], sortByRules(toValue(sort) ?? [])))
  const list = computed(() => pipe(data.value.values(), unionFilters([filterByName(toValue(filter?.name) ?? ''), filterByKind(toValue(filter?.kind) ?? '')]), sortByRules(toValue(sort) ?? [])))
  const count = computed(() => formatCount(data.value.size, list.value.length))

  return {
    count,
    data,
    list,
    all,
  }
}

function filterByName(name: string) {
  return function filterItemsByName(item: def.Detail) {
    if (!name || name.trim() === '') return true
    return item.name.toLowerCase().includes(name.toLowerCase())
  }
}

function filterByKind(kind: string) {
  return function filterItemsByKind(item: def.Detail) {
    if (!kind || kind.trim() === '') return true
    if (def.KindIdentifier.enum.sms.includes(kind) && 'sms' in item.kind) return true
    if (def.KindIdentifier.enum.email.includes(kind) && 'email' in item.kind) return true
    return false
  }
}

export function useItem(uuid: MaybeRefOrGetter<string>) {
  const { data } = useState()
  const item = computed(() => data.value.get(toValue(uuid)) ?? null)
  const { kind } = useKind(() => item.value)

  return {
    item,
    kind,
  }
}

export function useKind(input?: MaybeRefOrGetter<def.FormData | undefined | null>) {
  const { t } = useI18n({ useScope: 'global' })

  const kind = computed<def.KindIdentifier | null>(() => {
    try {
      const data = toValue(input)
      if (!data) return null
      return getKind(data)
    } catch (error) {
      logger.error(error)
      return null
    }
  })

  return {
    get options() {
      return def.KindIdentifier.options.map((value) => ({
        value,
        label: t(`contact.kind.${value}`, value),
      }))
    },
    kind,
  }
}

export function useForm(input: MaybeRefOrGetter<def.FormData | undefined | null>) {
  const { t } = useI18n({ useScope: 'global' })
  const kind = ref<def.KindIdentifier>(def.DEFAULT_KIND)
  const { options } = useKind()

  const dialogForm = useDialogForm({
    data: input,
    seed: () => service.seed(toValue(kind)),
    type: {
      create: def.FormData,
      update: def.Detail,
    },
  })

  const title = computed(() => {
    if (!dialogForm.isUpdate(toValue(input))) {
      return t('contact.dialog.create', '')
    }
    return dialogForm.hasChanges.value ? t('contact.dialog.edit', '') : t('contact.dialog.title', '')
  })

  // Keep kind in sync with form data
  watchEffect(() => {
    const data = toValue(input)
    if (!data) return
    const parsed = def.KindIdentifier.safeParse('sms' in data.kind ? def.KindIdentifier.enum.sms : 'email' in data.kind ? def.KindIdentifier.enum.email : null)
    if (!parsed.success) return
    kind.value = parsed.data
  })

  watch(kind, async (next, old) => {
    if (!next || next === old) return
    if (dialogForm.isUpdate(toValue(input))) return // Don't change kind on existing items
    const seedData = await service.seed(next)
    Object.assign(dialogForm.formData, { kind: seedData.kind })
  })

  return {
    ...dialogForm,
    kind,
    kindOptions: options,
    title,
    create: useAction(create),
    update: useAction(update),
    remove: useAction(confirmAndRemove),
    seed: service.seed,
  }

  function create() {
    return service.create(def.FormData.parse(dialogForm.formData))
  }

  function update() {
    return service.update(def.Detail.parse(dialogForm.formData))
  }

  function remove() {
    const { uuid } = def.Detail.parse(dialogForm.formData)
    return service.remove(uuid)
  }

  function confirmAndRemove(cb?: () => any) {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (!confirm(t('contact.dialog.confirmDelete', ''))) {
          resolve()
          return
        }
        remove()
          .then(() => (cb ? cb() : void 0))
          .then(resolve)
      })
    })
  }
}
