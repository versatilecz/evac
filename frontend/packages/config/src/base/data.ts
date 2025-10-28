import { from, map } from 'rxjs'
import { service } from '../service'
import { $BaseConfig } from './definitions'

export const baseConfig$ = from(service).pipe(map((data) => data.base))

export function setBaseConfig(base: $BaseConfig) {
  return service.set({ base: $BaseConfig.parse(base) }, service)
}
