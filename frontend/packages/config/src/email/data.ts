import { from, map } from 'rxjs'
import { service } from '../service'
import { EmailConfig, type $EmailConfig } from './definitions'

export const emailConfig$ = from(service).pipe(map((data) => data.email))

export async function setEmailConfig(email: $EmailConfig) {
  const state = await service.get()
  if (!state) throw new Error('Cannot set email config: service state is undefined')
  return service.set({ ...state, email: EmailConfig.parse(email) })
}
