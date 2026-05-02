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
</script>

<template>
  <div
    class="relative overflow-hidden cursor-grab active:cursor-grabbing min-h-0 h-full bg-darwin-bg/80"
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
      :height="totalHeightPx"
    >
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
