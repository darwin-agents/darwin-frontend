<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { pickTimelineTickStepMs, useCanvasLayout } from '~/composables/useCanvasLayout'

const { locale } = useI18n()
const canvas = useCanvasStore()
const { zoomLevel, scrollX } = storeToRefs(canvas)
const { timestampToX, xToTimestampMs } = useCanvasLayout()

const rulerEl = ref<HTMLElement | null>(null)
const rulerWidthPx = ref(0)

/** Minimum horizontal gap between kept labels (tick marks can stay denser later). */
const MIN_LABEL_GAP_PX = 76
const MAX_TICK_ITER = 56

let ro: ResizeObserver | null = null

onMounted(() => {
  nextTick(() => {
    const el = rulerEl.value
    if (!el) return
    const measure = () => {
      rulerWidthPx.value = el.clientWidth
    }
    measure()
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure)
      ro.observe(el)
    }
  })
})

onUnmounted(() => {
  ro?.disconnect()
  ro = null
})

function formatTickLabel(ms: number, stepMs: number): string {
  const d = new Date(ms)
  if (stepMs >= 7 * 86_400_000) {
    return d.toLocaleDateString(locale.value, { month: 'short', year: 'numeric' })
  }
  if (stepMs >= 86_400_000) {
    return d.toLocaleDateString(locale.value, { month: 'short', day: 'numeric' })
  }
  if (stepMs < 1000) {
    const t = d.toLocaleTimeString(locale.value, {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    const frac = String(ms % 1000).padStart(3, '0')
    return `${t}.${frac}`
  }
  if (stepMs < 60_000) {
    return d.toLocaleTimeString(locale.value, {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }
  return d.toLocaleString(locale.value, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function subsampleByScreenGap(
  items: { ms: number; screenX: number; label: string }[],
  gapPx: number,
): { ms: number; screenX: number; label: string }[] {
  const sorted = [...items].sort((a, b) => a.screenX - b.screenX)
  const out: typeof items = []
  let lastX = -Infinity
  for (const it of sorted) {
    if (it.screenX - lastX >= gapPx) {
      out.push(it)
      lastX = it.screenX
    }
  }
  return out
}

const ticks = computed(() => {
  const w = rulerWidthPx.value
  const sx = scrollX.value
  const z = zoomLevel.value
  if (w <= 0) return [] as { ms: number; screenX: number; label: string }[]

  const stepMs = pickTimelineTickStepMs(z, w)
  const leftT = xToTimestampMs(sx)
  const rightT = xToTimestampMs(sx + w)

  const lo = Math.min(leftT, rightT)
  const hi = Math.max(leftT, rightT)

  let t0 = Math.ceil(lo / stepMs) * stepMs
  const raw: { ms: number; screenX: number; label: string }[] = []

  let iter = 0
  for (let t = t0; t <= hi + stepMs && iter < MAX_TICK_ITER; t += stepMs, iter++) {
    const x = timestampToX(t)
    const screenX = x - sx
    if (screenX < -100 || screenX > w + 100) continue
    raw.push({
      ms: t,
      screenX,
      label: formatTickLabel(t, stepMs),
    })
  }

  return subsampleByScreenGap(raw, MIN_LABEL_GAP_PX)
})

const zoomLabel = computed(() =>
  new Intl.NumberFormat(locale.value, { style: 'percent' }).format(Math.round(zoomLevel.value * 100) / 100),
)
const stepHint = computed(() => {
  const s = pickTimelineTickStepMs(zoomLevel.value, rulerWidthPx.value)
  const [n, unit]: [number, string] =
    s < 1000 ? [s, 'millisecond']
    : s < 60_000 ? [Math.round(s / 1000), 'second']
    : s < 3600_000 ? [Math.round(s / 60_000), 'minute']
    : s < 86_400_000 ? [Math.round(s / 3600_000), 'hour']
    : [Math.round(s / 86_400_000), 'day']
  return new Intl.NumberFormat(locale.value, { style: 'unit', unit, unitDisplay: 'short' }).format(n)
})
</script>

<template>
  <div
    ref="rulerEl"
    class="relative z-20 shrink-0 h-9 border-b border-darwin-border bg-darwin-surface/90 backdrop-blur-md select-none"
  >
    <div class="pointer-events-none absolute inset-x-0 bottom-0 right-24 top-1">
      <div
        v-for="(tick, i) in ticks"
        :key="`${tick.ms}-${i}`"
        class="absolute bottom-0 left-0 flex flex-col items-center"
        :style="{ transform: `translateX(${tick.screenX}px)` }"
      >
        <span
          class="mb-0.5 max-w-[7rem] truncate text-center text-[10px] font-mono leading-tight text-darwin-ink-soft tabular-nums"
          :title="new Date(tick.ms).toISOString()"
        >
          {{ tick.label }}
        </span>
        <div class="h-2 w-px shrink-0 rounded-full bg-darwin-muted-2/80" />
      </div>
    </div>

    <div
      class="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 flex-col items-end gap-0 text-[9px] font-mono leading-tight text-darwin-muted tabular-nums"
    >
      <span>{{ zoomLabel }}</span>
      <span class="text-darwin-muted-2">{{ stepHint }}</span>
    </div>
  </div>
</template>
