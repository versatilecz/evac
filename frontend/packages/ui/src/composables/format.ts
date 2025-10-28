import { useI18n } from 'vue-i18n'
import { DEFAULT_LOCALE } from '@evac/shared'
import { intl, formatCount } from '@evac/utils'
import { reactive, watchEffect } from 'vue'

type Formatters = {
  [key in keyof typeof intl]: ReturnType<(typeof intl)[key]>
} & {
  count(all: number, filtered: number): string
}

export function useFormat() {
  const { locale } = useI18n({ useScope: 'global' })

  const formatters = reactive(resolveFormatters())

  watchEffect(() => Object.assign(formatters, resolveFormatters(locale.value)))

  return formatters

  function resolveFormatters(locale = DEFAULT_LOCALE): Formatters {
    return {
      date: intl.date(locale),
      dateTime: intl.dateTime(locale),
      percent: intl.percent(locale),
      sort: intl.sort(locale),
      count: formatCount,
    } satisfies Formatters
  }
}
