import { useCanvasStore } from '~/stores/canvas'
import { useCanvasLayout } from '~/composables/useCanvasLayout'
import type { DarwinEvent } from '~/types/events'

const BUFFER_PX = 200

export function useVirtualScroll() {
  const canvas = useCanvasStore()
  const { timestampToX } = useCanvasLayout()
  const viewportWidth = ref(0)

  if (import.meta.client) {
    onMounted(() => {
      const update = () => {
        viewportWidth.value = window.innerWidth
      }
      update()
      window.addEventListener('resize', update)
      onUnmounted(() => window.removeEventListener('resize', update))
    })
  }

  const visibleTrunkEvents = computed(() => {
    const scrollX = canvas.scrollX
    const leftEdge = scrollX - BUFFER_PX
    const rightEdge = scrollX + viewportWidth.value + BUFFER_PX

    return canvas.trunkEvents.filter((event) => {
      const x = timestampToX(event.timestamp_ms)
      return x >= leftEdge && x <= rightEdge
    })
  })

  function visibleLaneEvents(laneEvents: DarwinEvent[]): DarwinEvent[] {
    const scrollX = canvas.scrollX
    const leftEdge = scrollX - BUFFER_PX
    const rightEdge = scrollX + viewportWidth.value + BUFFER_PX

    return laneEvents.filter((event) => {
      const x = timestampToX(event.timestamp_ms)
      return x >= leftEdge && x <= rightEdge
    })
  }

  return { visibleTrunkEvents, visibleLaneEvents, viewportWidth }
}
