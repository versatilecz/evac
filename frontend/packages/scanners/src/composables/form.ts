import { useAction, useDialogForm } from '@evac/ui'
import { computed, type MaybeRefOrGetter } from 'vue'
import { useI18n } from 'vue-i18n'
import { $Scanner } from '@/definitions'
import { service } from '@/service'

export function useScannerForm(input: MaybeRefOrGetter<$Scanner>) {
  const { t } = useI18n({ useScope: 'global' })
  const dialogForm = useDialogForm({
    data: input,
    type: {
      update: $Scanner,
    },
  })

  const title = computed(() => {
    const currentData = { ...dialogForm.formData }
    if (!dialogForm.isUpdate(currentData)) {
      return t('scanner.dialog.create', '')
    }
    return dialogForm.hasChanges.value ? t('scanner.dialog.edit', '') : t('scanner.dialog.title', '')
  })

  return {
    ...dialogForm,
    title,
    update: useAction(update),
    remove: useAction(confirmAndRemove),
  }

  function update() {
    return service.update($Scanner.parse(dialogForm.formData))
  }

  function remove() {
    const { uuid } = $Scanner.parse(dialogForm.formData)
    return service.remove(uuid)
  }

  function confirmAndRemove(cb?: () => any) {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (!confirm(t('scanner.dialog.confirmDelete', ''))) {
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
