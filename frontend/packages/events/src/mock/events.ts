import * as Rx from 'rxjs'
import { $Event } from '../definitions'
import { devices$ } from '@evac/devices'
import { scanners$ } from '@evac/scanners'

export default async function mockEvents(): Promise<$Event[]> {
  const devices = await Rx.firstValueFrom(devices$.pipe(Rx.filter((x) => x.size > 0)))
  const scanners = await Rx.firstValueFrom(scanners$.pipe(Rx.filter((x) => x.size > 0)))

  return [
    {
      uuid: crypto.randomUUID(),
      kind: 'advertisement',
      scanner: scanners.keys().next().value!,
      timestamp: new Date(),
      device: devices.keys().next().value!,
    },
  ]
}
