import { logger } from '@evac/shared'
import { useAction } from '@evac/ui'
import { useObservable } from '@vueuse/rxjs'
import { activeAlarm$ } from '@/data'
import { activeAlarmService } from '@/service'

export function useActiveAlarm() {
  const data = useObservable(activeAlarm$, { onError: logger.error, initialValue: undefined })

  return {
    data,
    stop: useAction(activeAlarmService.stop),
  }
}
