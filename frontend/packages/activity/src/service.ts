import { $ConfigMessage } from '@evac/config'
import { defineService } from '@evac/shared'
import * as def from './definitions'
import * as Rx from 'rxjs'

const CLEAN_INTERVAL = 1_000 // 1s

const activityDiff$$ = new Rx.BehaviorSubject<number>(0)
const cleanActivity$ = activityDiff$$.pipe(
  Rx.switchMap((diff) => (diff > 0 ? Rx.interval(CLEAN_INTERVAL).pipe(Rx.map(() => diff)) : Rx.NEVER)),
  Rx.switchMap((diff) => service.clean(diff))
)
const subscriptions = new Set<Rx.Subscription>()

export const service = defineService({
  name: def.SCOPE,
  identity: def.$ActivityByDevice,
})
  .withSources(
    async function* onList(source) {
      for await (const message of source) {
        const parsed = def.$ActivityListMessage.safeParse(message)
        if (!parsed.success) continue
        yield parsed.data
      }
    },
    async function* onDetail(source) {
      for await (const message of source) {
        const parsed = def.$ActivityMessage.safeParse(message)
        if (!parsed.success) continue

        const state = await this.get()
        const next = new Map(state ?? [])
        next.set(parsed.data.device, parsed.data)
        yield next
      }
    },
    async function* onConfig(source) {
      for await (const message of source) {
        const parsed = $ConfigMessage.safeParse(message)
        if (!parsed.success) continue

        const diffSec = parsed.data.Config.base.activityDiff ?? 0
        activityDiff$$.next(diffSec * 1000)

        const state = await this.get()
        const next = new Map(state ?? [])
        yield next
      }
    }
  )
  .withActions({
    async clean(_, diff: number) {
      const state = await this.get()
      if (!state) return

      const next = new Map(filterOutdatedActivities(state, diff))
      this.set(next)
    },
  })

service.addEventListener('start', () => {
  subscriptions.add(cleanActivity$.subscribe())
})

service.addEventListener('stop', () => {
  for (const sub of subscriptions) {
    sub.unsubscribe()
  }
  subscriptions.clear()
})

function* filterOutdatedActivities(activities: Map<def.$Activity['device'], def.$Activity>, threshold: number): Generator<[def.$Activity['device'], def.$Activity]> {
  const now = Date.now()
  for (const [device, activity] of activities) {
    const current = typeof activity.timestamp === 'string' ? Date.parse(activity.timestamp) : activity.timestamp
    if (now - current > threshold) continue
    yield [device, activity]
  }
}
