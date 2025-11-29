import { useAction, useDialogForm } from '@evac/ui'
import { computed, type MaybeRefOrGetter } from 'vue'
import { useI18n } from 'vue-i18n'
import { $Alarm, $AlarmFormData } from '@/definitions'
import { service } from '@/service'

export function useAlarmForm(input?: MaybeRefOrGetter<$Alarm | $AlarmFormData | undefined | null>) {
  const { t } = useI18n({ useScope: 'global' })
  const dialogForm = useDialogForm({
    data: input,
    seed: service.seed,
    type: {
      create: $AlarmFormData,
      update: $Alarm,
    },
  })

  const title = computed(() => {
    const currentData = { ...dialogForm.formData }
    if (!dialogForm.isUpdate(currentData)) {
      return t('alarm.dialog.create', '')
    }
    return dialogForm.hasChanges.value ? t('alarm.dialog.edit', '') : t('alarm.dialog.title', '')
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
    return service.create($AlarmFormData.parse(dialogForm.formData))
  }

  function update() {
    return service.update($Alarm.parse(dialogForm.formData))
  }

  function remove() {
    const { uuid } = $Alarm.parse(dialogForm.formData)
    return service.remove(uuid)
  }

  function confirmAndRemove(cb?: () => any) {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (!confirm(t('alarm.dialog.confirmDelete', ''))) {
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
