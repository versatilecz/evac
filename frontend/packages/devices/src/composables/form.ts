import { useAction, useDialogForm } from '@evac/ui'
import { computed, type MaybeRefOrGetter } from 'vue'
import { useI18n } from 'vue-i18n'
import { $Device } from '@/definitions'
import { service } from '@/service'

export function useDeviceForm(input: MaybeRefOrGetter<$Device>) {
  const { t } = useI18n({ useScope: 'global' })
  const dialogForm = useDialogForm({
    data: input,
    type: {
      update: $Device,
    },
  })

  const title = computed(() => {
    const currentData = { ...dialogForm.formData }
    if (!dialogForm.isUpdate(currentData)) {
      return t('device.dialog.create', '')
    }
    return dialogForm.hasChanges.value ? t('device.dialog.edit', '') : t('device.dialog.title', '')
  })

  return {
    ...dialogForm,
    title,
    update: useAction(update),
    remove: useAction(confirmAndRemove),
  }

  function update() {
    return service.update($Device.parse(dialogForm.formData))
  }

  function remove() {
    const { uuid } = $Device.parse(dialogForm.formData)
    return service.remove(uuid)
  }

  function confirmAndRemove(cb?: () => any) {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (!confirm(t('device.dialog.confirmDelete', ''))) {
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
