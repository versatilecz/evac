import { formatCount, intersectFilters, logger, sortByRules, type SortRule } from '@evac/shared'
import { useAction, useDialogForm } from '@evac/ui'
import { useObservable } from '@vueuse/rxjs'
import { pipe } from 'remeda'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useI18n } from 'vue-i18n'

import { state$ } from './data'
import * as def from './definitions'
import { service } from './service'
import * as filter from './misc/filter'

type FilterOptions = {
  name?: MaybeRefOrGetter<def.Detail['name']>
  reference?: MaybeRefOrGetter<def.ReferenceFilter>
}

type Options = {
  filter?: FilterOptions
  sort?: MaybeRefOrGetter<SortRule[]>
}

export function useState(options: Options = {}) {
  const sortFn = computed(() => toValue(options.sort) ?? [def.DEFAULT_SORT])
  const state = useObservable(state$, { onError: logger.error, initialValue: new Map<def.Detail['uuid'], def.Detail>() })
  const all = computed(() => pipe([...state.value.values()], sortByRules(sortFn.value)))
  const list = computed(() => pipe(
    state.value.values(),
    intersectFilters([
      filter.byName(toValue(options.filter?.name) ?? ''),
      filter.byReference(toValue(options.filter?.reference) ?? def.ReferenceFilter.enum.all)
    ]),
    sortByRules(sortFn.value)
  ))
  const count = computed(() => formatCount(state.value.size, list.value.length))

  return {
    count,
    state,
    list,
    all,
  }
}

export function useDetail(uuid: MaybeRefOrGetter<def.Detail['uuid']>) {
  const { state } = useState()
  const detail = computed(() => state.value.get(toValue(uuid)) ?? null)

  return {
    detail,
  }
}

export function useForm(input: MaybeRefOrGetter<def.FormData | null | undefined>) {
  const { t } = useI18n({ useScope: 'global' })
  const dialogForm = useDialogForm({
    data: input,
    seed: service.seed,
    type: {
      create: def.FormData,
      update: def.Detail,
    },
  })

  const title = computed(() => {
    if (!dialogForm.isUpdate(toValue(input))) {
      return t('location.dialog.create', '')
    }
    return dialogForm.hasChanges.value ? t('location.dialog.edit', '') : t('location.dialog.title', '')
  })

  return {
    ...dialogForm,
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
        if (!confirm(t('location.dialog.confirmDelete', ''))) {
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
