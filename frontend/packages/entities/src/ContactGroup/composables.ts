import { formatCount, logger, sortByRules, type SortRule } from '@evac/shared'
import { useAction, useDialogForm } from '@evac/ui'
import { useObservable } from '@vueuse/rxjs'
import { pipe } from 'remeda'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useI18n } from 'vue-i18n'

import { state$ } from './data'
import * as def from './definitions'
import { service } from './service'

type Options = {
  sort?: MaybeRefOrGetter<SortRule[]>
}

export function useState({ sort = [def.DEFAULT_SORT] }: Options = {}) {
  const state = useObservable(state$, { onError: logger.error, initialValue: new Map<string, def.Detail>() })
  const all = computed(() => pipe([...state.value.values()], sortByRules(toValue(sort) ?? [])))
  const list = computed(() => pipe(state.value.values(), sortByRules(toValue(sort) ?? [])))
  const count = computed(() => formatCount(state.value.size, list.value.length))

  return {
    count,
    state,
    list,
    all,
  }
}

export function useDetail(uuid: MaybeRefOrGetter<string>) {
  const { state } = useState()
  const detail = computed(() => state.value.get(toValue(uuid)) ?? null)

  return {
    detail,
  }
}

export function useForm(input?: MaybeRefOrGetter<def.FormData | undefined | null>) {
  const { t } = useI18n({ useScope: 'global' })

  const dialogForm = useDialogForm({
    data: input,
    seed: () => service.seed(),
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
