import { useCanvasStore } from '~/stores/canvas'

const MS_PER_PX = 1000

/** Left gutter so the genesis node / selection ring are not clipped at x=0 */
export const CANVAS_ORIGIN_PAD_X = 64

/** Matches `CanvasNode`: lanes/trunk skip spawn markers (no rendered disc). */
export function eventTypeHasCanvasNode(eventType: string): boolean {
  return eventType !== 'NEURON_SPAWNED'
}

/** Round up to 1/2/5×10^n ms so minimum steps stay human-readable. */
function roundUpToNiceMs(ms: number): number {
  if (!Number.isFinite(ms) || ms <= 0) return 1000
  const exp = Math.floor(Math.log10(ms))
  const base = 10 ** exp
  for (const k of [1, 2, 5, 10]) {
    const c = k * base
    if (c + 1e-9 >= ms) return Math.round(c)
  }
  return Math.round(10 * base)
}

/**
 * Pick a “nice” tick interval (ms): ~targetMajorPx apart, and never more than
 * ~maxTicksAcrossViewport labels for the currently visible width (prevents overlap when the chart is very wide).
 */
export function pickTimelineTickStepMs(
  zoomLevel: number,
  viewportWidthPx?: number,
  targetMajorPx = 88,
  maxTicksAcrossViewport = 10,
): number {
  const z = Number(zoomLevel)
  const pxPerMs = z / MS_PER_PX
  if (!Number.isFinite(pxPerMs) || pxPerMs <= 0) return 86_400_000

  const rough = targetMajorPx / pxPerMs
  const exp = Math.floor(Math.log10(Math.max(rough, 1e-9)))
  const f = rough / 10 ** exp
  let n = 1
  if (f <= 1.5) n = 1
  else if (f <= 3.5) n = 2
  else if (f <= 7.5) n = 5
  else n = 10
  let step = Math.max(1, Math.round(n * 10 ** exp))

  if (viewportWidthPx != null && viewportWidthPx > 0 && z > 0) {
    const visibleMs = (viewportWidthPx / z) * MS_PER_PX
    const minStepRaw = visibleMs / maxTicksAcrossViewport
    step = Math.max(step, roundUpToNiceMs(minStepRaw))
  }

  return Math.max(1, step)
}

export function useCanvasLayout() {
  const canvas = useCanvasStore()

  const genesisMs = computed(() => canvas.minTimestamp)

  function timestampToX(timestamp_ms: number): number {
    const z = canvas.zoomLevel
    return CANVAS_ORIGIN_PAD_X + ((timestamp_ms - genesisMs.value) / MS_PER_PX) * z
  }

  /** Inverse of `timestampToX`: SVG x-coordinate → absolute unix ms. */
  function xToTimestampMs(x: number): number {
    const z = canvas.zoomLevel
    if (z <= 0) return genesisMs.value
    return genesisMs.value + ((x - CANVAS_ORIGIN_PAD_X) / z) * MS_PER_PX
  }

  const totalWidthPx = computed(() => {
    const pad = 400
    const maxT = canvas.maxTimestamp || genesisMs.value
    return Math.max(800, timestampToX(maxT) + pad)
  })

  const trunkY = 80
  const laneHeight = 60

  const laneCount = computed(() => Object.keys(canvas.neuronLanes).length)

  const totalHeightPx = computed(() => trunkY + (laneCount.value + 1) * laneHeight + 40)

  return { genesisMs, timestampToX, xToTimestampMs, totalWidthPx, totalHeightPx, trunkY, laneHeight, MS_PER_PX }
}
