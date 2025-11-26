import { activity$ } from '@evac/activity'
import type { Location } from '@evac/entities'
import { rooms$, type $Room } from '@evac/rooms'
import { scanners$ } from '@evac/scanners'
import * as Rx from 'rxjs'
import type { $Device, $Devices, $DeviceWithActivity } from '@/definitions'
import { collectDevicesByLocation, collectDevicesByRoom, collectUnallocatedDevices } from '@/misc'
import { service } from '@/service'

export const devices$ = Rx.from(service).pipe(Rx.shareReplay(1))

export const unallocatedDevices$ = Rx.combineLatest([activity$, devices$]).pipe(
  Rx.map(([activity, devices]) => Iterator.from(collectUnallocatedDevices({ activity, devices }))),
  Rx.map((it) => new Map(it.map((x) => [x.uuid, x])) satisfies $Devices)
)

export function mapRoomToDevices() {
  return Rx.pipe<Rx.Observable<$Room['uuid']>, Rx.Observable<Map<$Device['uuid'], $DeviceWithActivity>>>(Rx.switchMap(devicesByRoom))
}

export function mapLocationToDevices() {
  return Rx.pipe<Rx.Observable<Location.Detail['uuid']>, Rx.Observable<Map<$Device['uuid'], $DeviceWithActivity>>>(Rx.switchMap(devicesByLocation))
}

export function devicesByRoom(roomUuid: $Room['uuid']) {
  return Rx.combineLatest([activity$, devices$, scanners$]).pipe(
    Rx.map(([activity, devices, scanners]) => Iterator.from(collectDevicesByRoom(roomUuid, { activity, devices, scanners: new Set(scanners.values()) }))),
    Rx.map((it) => new Map(it.map((x) => [x.uuid, x])) satisfies $Devices) // Actually it's Map<string, $DeviceWithActivity> but we want to make sure it's compatible with $Devices
  )
}

export function devicesByLocation(locationUuid: Location.Detail['uuid']) {
  return Rx.combineLatest([activity$, devices$, scanners$, rooms$]).pipe(
    Rx.map(([activity, devices, scanners, rooms]) =>
      Iterator.from(collectDevicesByLocation(locationUuid, { activity, devices, rooms: new Set(rooms.values()), scanners: new Set(scanners.values()) }))
    ),
    Rx.map((it) => new Map(it.map((x) => [x.uuid, x])) satisfies $Devices) // Actually it's Map<string, $DeviceWithActivity> but we want to make sure it's compatible with $Devices
  )
}
