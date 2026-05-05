<script setup lang="ts">
import type { DarwinEvent } from '~/types/events'
import { useCanvasStore } from '~/stores/canvas'
import { eventTypeHasCanvasNode, useCanvasLayout } from '~/composables/useCanvasLayout'
import CanvasNode from '~/components/canvas/CanvasNode.vue'

defineProps<{
  events: DarwinEvent[]
  darwinId: string
}>()

const canvas = useCanvasStore()
const { timestampToX, trunkY } = useCanvasLayout()

const agent = useAgentStore()

const trunkClass = computed(() => ({
  'trunk-active': agent.isActive,
  'trunk-hibernating': agent.isHibernating,
  'trunk-terminated': agent.isTerminated,
}))

/** Segments only between consecutive trunk nodes (no timeline spine across empty space). */
const trunkSegments = computed(() => {
  const sorted = [...canvas.trunkEvents]
    .filter((e) => eventTypeHasCanvasNode(e.event_type))
    .sort((a, b) => a.timestamp_ms - b.timestamp_ms)
  const out: { x1: number; x2: number }[] = []
  for (let i = 0; i < sorted.length - 1; i++) {
    const x1 = timestampToX(sorted[i].timestamp_ms)
    const x2 = timestampToX(sorted[i + 1].timestamp_ms)
    if (Math.abs(x2 - x1) < 0.5) continue
    out.push({ x1, x2 })
  }
  return out
})
</script>

<template>
  <line
    v-for="(seg, i) in trunkSegments"
    :key="`trunk-${i}`"
    :x1="seg.x1"
    :x2="seg.x2"
    :y1="trunkY"
    :y2="trunkY"
    stroke-linecap="round"
    :class="trunkClass"
  />
  <CanvasNode
    v-for="event in events"
    :key="event.id"
    :event="event"
    :darwin-id="darwinId"
    :x="timestampToX(event.timestamp_ms)"
    :y="trunkY"
  />
</template>
