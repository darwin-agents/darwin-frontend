<script setup lang="ts">
import { ChevronsRight } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useCanvasStore } from '~/stores/canvas'
import { useVirtualScroll } from '~/composables/useVirtualScroll'
import { useCanvasLayout } from '~/composables/useCanvasLayout'
import DarwinTrunk from '~/components/canvas/DarwinTrunk.vue'
import NeuralThread from '~/components/canvas/NeuralThread.vue'

defineProps<{ darwinId: string }>()

const { t } = useI18n()
const canvas = useCanvasStore()
const { scrollX } = storeToRefs(canvas)
const { visibleTrunkEvents, visibleLaneEvents } = useVirtualScroll()
const { totalWidthPx, totalHeightPx, timestampToX } = useCanvasLayout()

/** Padding from viewport right edge when snapping to the newest event (world px). */
const TAIL_VIEWPORT_PAD = 96
/** Hide “Latest” when scroll is within this distance of the computed tail position. */
const TAIL_PROXIMITY_PX = 40

/** Timeline chart region below the ruler (not full column height). */
const chartAreaEl = ref<HTMLElement | null>(null)
const viewportHeightPx = ref(0)
const viewportWidthPx = ref(0)

function measureViewportSize() {
  const el = chartAreaEl.value
  viewportHeightPx.value = el?.clientHeight ?? 0
  viewportWidthPx.value = el?.clientWidth ?? 0
}

const svgDisplayHeight = computed(() =>
  Math.max(totalHeightPx.value, viewportHeightPx.value),
)

const svgDisplayWidth = computed(() =>
  Math.max(totalWidthPx.value, viewportWidthPx.value),
)

const sortedLanes = computed(() =>
  Object.values(canvas.neuronLanes).sort((a, b) => a.spawn_timestamp_ms - b.spawn_timestamp_ms),
)

function computeTailScrollX(): number {
  const w = viewportWidthPx.value
  if (w <= 0 || !canvas.events.length) return 0
  const endX = timestampToX(canvas.maxTimestamp)
  const raw = endX - w + TAIL_VIEWPORT_PAD
  const maxScroll = Math.max(0, svgDisplayWidth.value - w)
  return Math.max(0, Math.min(maxScroll, raw))
}

function scrollToLatestEvent() {
  canvas.setScroll(computeTailScrollX())
}

const showJumpToLatest = computed(() => {
  if (!canvas.events.length || viewportWidthPx.value <= 0) return false
  return Math.abs(scrollX.value - computeTailScrollX()) > TAIL_PROXIMITY_PX
})

let dragging = false
let dragStartX = 0

function onMouseDown(e: MouseEvent) {
  dragging = true
  dragStartX = e.clientX + scrollX.value
}

function onMouseMove(e: MouseEvent) {
  if (!dragging) return
  canvas.setScroll(dragStartX - e.clientX)
}

function onMouseUp() {
  dragging = false
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  canvas.setZoom(canvas.zoomLevel * delta)
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  nextTick(() => {
    measureViewportSize()
    const el = chartAreaEl.value
    if (!el || typeof ResizeObserver === 'undefined') return
    resizeObserver = new ResizeObserver(() => measureViewportSize())
    resizeObserver.observe(el)
  })
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<template>
  <div
    class="relative flex min-h-0 h-full w-full flex-1 flex-col overflow-hidden rounded-none bg-gradient-to-b from-darwin-bg via-darwin-bg to-darwin-bg-2 shadow-[inset_0_0_100px_rgba(10,10,10,0.04)] cursor-grab active:cursor-grabbing"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
    @wheel.prevent="onWheel"
  >
    <CanvasTimestampRuler />
    <div ref="chartAreaEl" class="relative min-h-0 flex-1 overflow-hidden">
      <svg
        class="absolute top-0 left-0 overflow-visible"
        :style="{ transform: `translateX(${-canvas.scrollX}px)` }"
        :width="svgDisplayWidth"
        :height="svgDisplayHeight"
      >
        <defs>
          <pattern id="darwin-canvas-dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.15" fill="#8a857a" opacity="0.11" />
          </pattern>
          <linearGradient id="darwin-canvas-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f3eee2" stop-opacity="0.55" />
            <stop offset="35%" stop-color="#f3eee2" stop-opacity="0" />
            <stop offset="65%" stop-color="#e9e2cf" stop-opacity="0" />
            <stop offset="100%" stop-color="#ddd4bd" stop-opacity="0.35" />
          </linearGradient>
        </defs>
        <rect :width="svgDisplayWidth" :height="svgDisplayHeight" fill="url(#darwin-canvas-dots)" pointer-events="none" />
        <rect :width="svgDisplayWidth" :height="svgDisplayHeight" fill="url(#darwin-canvas-fade)" pointer-events="none" />
        <DarwinTrunk :events="visibleTrunkEvents" :darwin-id="darwinId" />
        <NeuralThread
          v-for="(lane, idx) in sortedLanes"
          :key="lane.neuron_id"
          :lane="lane"
          :lane-index="idx"
          :darwin-id="darwinId"
          :visible-events="visibleLaneEvents(lane.events)"
        />
      </svg>

      <Transition name="fade-in">
        <button
          v-if="showJumpToLatest"
          type="button"
          class="pointer-events-auto absolute bottom-4 right-4 z-30 flex cursor-pointer items-center gap-1.5 rounded-full border border-darwin-border bg-darwin-surface/95 px-3 py-2 text-xs font-medium text-darwin-ink shadow-lg backdrop-blur-sm transition-colors hover:bg-darwin-bg-3"
          :aria-label="t('canvas.viewport.jumpToLatest')"
          @mousedown.stop.prevent
          @click.stop.prevent="scrollToLatestEvent"
        >
          <ChevronsRight :size="14" class="text-darwin-accent shrink-0" />
          <span class="hidden sm:inline">{{ t('canvas.viewport.latest') }}</span>
        </button>
      </Transition>
    </div>
  </div>
</template>
