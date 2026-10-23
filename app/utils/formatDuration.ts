export function formatRelativeTime(iso: string | undefined): string {
  if (!iso) return '—'
  const locale = useNuxtApp().$i18n.locale.value
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'narrow' })
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (sec < 60) return rtf.format(-sec, 'second')
  const min = Math.floor(sec / 60)
  if (min < 60) return rtf.format(-min, 'minute')
  const hr = Math.floor(min / 60)
  if (hr < 48) return rtf.format(-hr, 'hour')
  return new Date(iso).toLocaleDateString(locale)
}
