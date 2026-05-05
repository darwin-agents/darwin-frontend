<script setup lang="ts">
import { useCanvasStore } from '~/stores/canvas'
import { useVirtualScroll } from '~/composables/useVirtualScroll'
import { useCanvasLayout } from '~/composables/useCanvasLayout'
import DarwinTrunk from '~/components/canvas/DarwinTrunk.vue'
import NeuralThread from '~/components/canvas/NeuralThread.vue'

defineProps<{ darwinId: string }>()

const canvas = useCanvasStore()
const { visibleTrunkEvents, visibleLaneEvents } = useVirtualScroll()
const { totalWidthPx, totalHeightPx } = useCanvasLayout()

const viewportEl = ref<HTMLElement | null>(null)
const viewportHeightPx = ref(0)

function measureViewportHeight() {
  const el = viewportEl.value
  viewportHeightPx.value = el?.clientHeight ?? 0
}

const svgDisplayHeight = computed(() =>
  Math.max(totalHeightPx.value, viewportHeightPx.value),
)

const sortedLanes = computed(() =>
  Object.values(canvas.neuronLanes).sort((a, b) => a.spawn_timestamp_ms - b.spawn_timestamp_ms),
)

let dragging = false
let dragStartX = 0

function onMouseDown(e: MouseEvent) {
  dragging = true
  dragStartX = e.clientX + canvas.scrollX
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
    measureViewportHeight()
    const el = viewportEl.value
    if (!el || typeof ResizeObserver === 'undefined') return
    resizeObserver = new ResizeObserver(() => measureViewportHeight())
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
    ref="viewportEl"
    class="relative overflow-hidden cursor-grab active:cursor-grabbing min-h-0 h-full w-full flex-1 rounded-none bg-gradient-to-b from-darwin-bg via-darwin-bg to-darwin-bg-2 shadow-[inset_0_0_100px_rgba(10,10,10,0.04)]"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
    @wheel.prevent="onWheel"
  >
    <svg
      class="absolute top-0 left-0 overflow-visible"
      :style="{ transform: `translateX(${-canvas.scrollX}px)` }"
      :width="totalWidthPx"
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
      <rect :width="totalWidthPx" :height="svgDisplayHeight" fill="url(#darwin-canvas-dots)" pointer-events="none" />
      <rect :width="totalWidthPx" :height="svgDisplayHeight" fill="url(#darwin-canvas-fade)" pointer-events="none" />
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
  </div>
</template>
