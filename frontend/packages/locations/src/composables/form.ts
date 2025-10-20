import { useAction, useDialogForm } from '@evac/ui'
import { computed, type MaybeRefOrGetter } from 'vue'
import { useI18n } from 'vue-i18n'
import { $Location, $LocationFormData } from '@/definitions'
import { service } from '@/service'

export function useLocationForm(input: MaybeRefOrGetter<$Location | $LocationFormData | undefined | null>) {
  const { t } = useI18n({ useScope: 'global' })
  const dialogForm = useDialogForm({
    data: input,
    seed: service.seed,
    type: {
      create: $LocationFormData,
      update: $Location,
    },
  })

  const title = computed(() => {
    const currentData = { ...dialogForm.formData }
    if (!dialogForm.isUpdate(currentData)) {
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
    return service.create($LocationFormData.parse(dialogForm.formData))
  }

  function update() {
    return service.update($Location.parse(dialogForm.formData))
  }

  function remove() {
    const { uuid } = $Location.parse(dialogForm.formData)
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
