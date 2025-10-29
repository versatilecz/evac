import type { $ActivityByDevice } from '@evac/activity'
import type { $Location } from '@evac/locations'
import type { $Room } from '@evac/rooms'
import type { $Scanner } from '@evac/scanners'
import * as R from 'remeda'
import type { $Device, $Devices, $DeviceWithActivity } from '@/definitions'

type Sources = {
  activity: $ActivityByDevice
  devices: $Devices
  scanners: Iterable<$Scanner>
}

export function* collectDevicesByLocation(locationUuid: $Location['uuid'], sources: Sources & { rooms: Iterable<$Room> }): Generator<$DeviceWithActivity> {
  const roomsByLocation = Map.groupBy(sources.rooms, R.prop('location'))

  for (const room of roomsByLocation.get(locationUuid) ?? []) {
    yield* collectDevicesByRoom(room.uuid, sources)
  }
}

export function* collectDevicesByRoom(roomUuid: $Room['uuid'], sources: Sources): Generator<$DeviceWithActivity> {
  const activityByScanner = Map.groupBy(sources.activity.values(), R.prop('scanner'))
  const scannersByRoom = Map.groupBy(sources.scanners, R.prop('room'))
  const roomScanners = scannersByRoom.get(roomUuid) ?? []

  for (const scanner of roomScanners) {
    for (const activity of activityByScanner.get(scanner.uuid) ?? []) {
      const device = sources.devices.get(activity.device)
      if (!device) continue
      yield {
        ...device,
        rssi: activity.rssi,
        timestamp: activity.timestamp,
      } satisfies $DeviceWithActivity
    }
  }
}

export function* collectUnallocatedDevices({ activity, devices }: Omit<Sources, 'scanners'>): Generator<$Device> {
  for (const device of devices.values()) {
    if (activity.has(device.uuid)) continue
    yield device
  }
}
