import { useCanvasStore } from '~/stores/canvas'

const MS_PER_PX = 1000

/** Left gutter so the genesis node / selection ring are not clipped at x=0 */
export const CANVAS_ORIGIN_PAD_X = 64

export function useCanvasLayout() {
  const canvas = useCanvasStore()

  const genesisMs = computed(() => canvas.events[0]?.timestamp_ms ?? 0)

  function timestampToX(timestamp_ms: number): number {
    const z = canvas.zoomLevel
    return CANVAS_ORIGIN_PAD_X + ((timestamp_ms - genesisMs.value) / MS_PER_PX) * z
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

  return { genesisMs, timestampToX, totalWidthPx, totalHeightPx, trunkY, laneHeight, MS_PER_PX }
}
