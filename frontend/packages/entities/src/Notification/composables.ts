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
  sort?: MaybeRefOrGetter<SortRule[] | SortRule>
}

export function useState({ sort = [def.DEFAULT_SORT] }: Options = {}) {
  const data = useObservable(state$, { onError: logger.error, initialValue: new Map<string, def.Detail>() })
  const all = computed(() => [...data.value.values()])
  const list = computed(() => pipe(data.value.values(), sortByRules(toValue(sort))))
  const count = computed(() => formatCount(data.value.size, list.value.length))

  return {
    count,
    data,
    list,
    all,
    send: useAction(service.send),
  }
}

export function useItem(uuid: MaybeRefOrGetter<string | null | undefined>) {
  const { data } = useState()
  const item = computed(() => data.value.get(toValue(uuid) ?? '') ?? null)

  return {
    item,
  }
}

export function useForm(input: MaybeRefOrGetter<def.FormData | undefined | null>) {
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
    const currentData = { ...dialogForm.formData }
    if (!dialogForm.isUpdate(currentData)) {
      return t('notification.dialog.create', '')
    }
    return dialogForm.hasChanges.value ? t('notification.dialog.edit', '') : t('notification.dialog.title', '')
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
        if (!confirm(t('notification.dialog.confirmDelete', ''))) {
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
