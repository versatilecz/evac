import { logger } from '@evac/shared'
import { useObservable } from '@vueuse/rxjs'
import { useAction, useDialogForm } from '@evac/ui'
import { from } from 'rxjs'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useI18n } from 'vue-i18n'
import { $Location, $LocationFormData } from './definitions'
import { service } from './service'

export const LocationsFilter = {
  all: 'all',
  withDevices: 'withDevices',
  withoutDevices: 'withoutDevices',
} as const

export type LocationsFilter = (typeof LocationsFilter)[keyof typeof LocationsFilter]

export function useLocations(filter: MaybeRefOrGetter<LocationsFilter> = LocationsFilter.all) {
  const data = useObservable(from(service), { onError: logger.error, initialValue: new Map<string, $Location>() })
  const all = computed(() => [...data.value.values()])
  const list = computed(() => [...filterLocations(all.value, toValue(filter))])
  const count = computed(() => data.value.size)

  return {
    count,
    data,
    list,
    all,
  }
}

export function useLocation(uuid: MaybeRefOrGetter<string>) {
  const { data } = useLocations()
  const location = computed(() => data.value.get(toValue(uuid)) ?? null)

  return {
    location,
  }
}

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

function* filterLocations(locations: Iterable<$Location>, filter: LocationsFilter): Generator<$Location, void, unknown> {
  for (const location of locations) {
    switch (filter) {
      case LocationsFilter.withDevices:
        continue // TODO
      case LocationsFilter.withoutDevices:
        yield location // TODO
        break
      case LocationsFilter.all:
      default:
        yield location
        break
    }
  }
}

export function* sortBy(locations: Iterable<$Location>, sortBy: keyof $Location, desc = false): Generator<$Location, void, unknown> {
  const sorted = [...locations].sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return desc ? 1 : -1
    if (a[sortBy] > b[sortBy]) return desc ? -1 : 1
    return 0
  })
  for (const location of sorted) {
    yield location
  }
}
