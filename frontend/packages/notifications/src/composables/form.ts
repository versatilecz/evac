import { useAction, useDialogForm } from '@evac/ui'
import { computed, type MaybeRefOrGetter } from 'vue'
import { useI18n } from 'vue-i18n'
import { $Notification, $NotificationFormData } from '@/definitions'
import { service } from '@/service'

export function useNotificationForm(input: MaybeRefOrGetter<$Notification | $NotificationFormData | undefined | null>) {
  const { t } = useI18n({ useScope: 'global' })
  const dialogForm = useDialogForm({
    data: input,
    seed: service.seed,
    type: {
      create: $NotificationFormData,
      update: $Notification,
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
    return service.create($NotificationFormData.parse(dialogForm.formData))
  }

  function update() {
    return service.update($Notification.parse(dialogForm.formData))
  }

  function remove() {
    const { uuid } = $Notification.parse(dialogForm.formData)
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
