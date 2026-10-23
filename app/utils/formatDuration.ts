export function formatRelativeTime(iso: string | undefined): string {
  if (!iso) return '—'
  const t = new Date(iso).getTime()
  const diff = Date.now() - t
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 48) return `${hr}h ago`
  return new Date(iso).toLocaleDateString()
}
