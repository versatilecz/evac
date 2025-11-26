import * as Rx from 'rxjs'
import { service } from '../service'
import { $BaseConfig } from './definitions'

export const baseConfig$ = Rx.from(service).pipe(
  Rx.map((data) => data.base),
  Rx.shareReplay(1)
)

export async function setBaseConfig(base: $BaseConfig) {
  const state = await service.get()
  if (!state) throw new Error('Cannot set base config: service state is undefined')
  return service.set({ base: $BaseConfig.parse(base) }, service)
}
