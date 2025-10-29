import { from, map } from 'rxjs'
import { service } from '../service'
import { $BaseConfig } from './definitions'

export const baseConfig$ = from(service).pipe(map((data) => data.base))

export async function setBaseConfig(base: $BaseConfig) {
  const state = await service.get()
  if (!state) throw new Error('Cannot set base config: service state is undefined')
  return service.set({ base: $BaseConfig.parse(base) }, service)
}
