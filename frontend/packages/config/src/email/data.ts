import { from, map } from 'rxjs'
import { service } from '../service'
import { EmailConfig, type $EmailConfig } from './definitions'

export const emailConfig$ = from(service).pipe(map((data) => data.email))

export function setEmailConfig(email: $EmailConfig) {
  return service.set({ email: EmailConfig.parse(email) }, service)
}
