import { useAction, useDialogForm } from '@evac/ui'
import { computed, type MaybeRefOrGetter } from 'vue'
import { useI18n } from 'vue-i18n'
import { $RoomFormData, $Room } from '@/definitions'
import { service } from '@/service'

export function useRoomForm(input?: MaybeRefOrGetter<$Room | $RoomFormData | undefined | null>) {
  const { t } = useI18n({ useScope: 'global' })
  const dialogForm = useDialogForm({
    data: input,
    seed: service.seed,
    type: {
      create: $RoomFormData,
      update: $Room,
    },
  })

  const title = computed(() => {
    const currentData = { ...dialogForm.formData }
    if (!dialogForm.isUpdate(currentData)) {
      return t('room.dialog.create', '')
    }
    return dialogForm.hasChanges.value ? t('room.dialog.edit', '') : t('room.dialog.title', '')
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
    return service.create($RoomFormData.parse(dialogForm.formData))
  }

  function update() {
    return service.update($Room.parse(dialogForm.formData))
  }

  function remove() {
    const { uuid } = $Room.parse(dialogForm.formData)
    return service.remove(uuid)
  }

  function confirmAndRemove(cb?: () => any) {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (!confirm(t('room.dialog.confirmDelete', ''))) {
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
