<script setup lang="ts">
import type { NeuronLane } from '~/types/canvas'
import type { DarwinEvent } from '~/types/events'
import { eventTypeHasCanvasNode, useCanvasLayout } from '~/composables/useCanvasLayout'
import CanvasNode from '~/components/canvas/CanvasNode.vue'

const props = defineProps<{
  lane: NeuronLane
  laneIndex: number
  visibleEvents: DarwinEvent[]
  darwinId: string
}>()

const { timestampToX, trunkY, laneHeight } = useCanvasLayout()

const laneY = computed(() => trunkY + (props.laneIndex + 1) * laneHeight)
const branchX = computed(() => timestampToX(props.lane.spawn_timestamp_ms))
const endX = computed(() =>
  props.lane.end_timestamp_ms ? timestampToX(props.lane.end_timestamp_ms) : null,
)

const branchPath = computed(
  () =>
    `M ${branchX.value} ${trunkY} C ${branchX.value + 40} ${trunkY}, ${branchX.value + 40} ${laneY.value}, ${branchX.value + 80} ${laneY.value}`,
)

const mergePath = computed(() => {
  if (!endX.value) return null
  return `M ${endX.value} ${laneY.value} C ${endX.value + 40} ${laneY.value}, ${endX.value + 40} ${trunkY}, ${endX.value + 80} ${trunkY}`
})

const laneLineClass = computed(() => {
  if (props.lane.status === 'completed') return 'lane-line-completed'
  if (props.lane.status === 'failed') return 'lane-line-failed'
  return 'lane-line-active'
})

const branchConnectX = computed(() => branchX.value + 80)

function dedupeAdjacentXs(xs: number[], eps = 0.75): number[] {
  const out: number[] = []
  for (const x of xs) {
    if (out.length === 0 || Math.abs(out[out.length - 1] - x) > eps) out.push(x)
  }
  return out
}

/** Horizontal rail segments: branch exit → each lane node → merge anchor (no extension to canvas edge). */
const laneSegments = computed(() => {
  const pts: number[] = []
  pts.push(branchConnectX.value)
  const sorted = [...props.lane.events]
    .filter((e) => eventTypeHasCanvasNode(e.event_type))
    .sort((a, b) => a.timestamp_ms - b.timestamp_ms)
  for (const e of sorted) pts.push(timestampToX(e.timestamp_ms))
  if (endX.value != null) pts.push(endX.value)
  const cleaned = dedupeAdjacentXs(pts)
  const out: { x1: number; x2: number }[] = []
  for (let i = 0; i < cleaned.length - 1; i++) {
    const x1 = cleaned[i]
    const x2 = cleaned[i + 1]
    if (Math.abs(x2 - x1) < 0.5) continue
    out.push({ x1, x2 })
  }
  return out
})

const spawnModel = computed(() => {
  const spawnEvent = props.lane.events.find(e => e.event_type === 'NEURON_SPAWNED')
  const m = (spawnEvent?.payload?.model as string | undefined) ?? ''
  if (m.includes('opus'))    return 'opus'
  if (m.includes('sonnet'))  return 'sonnet'
  if (m.includes('haiku'))   return 'haiku'
  if (m.includes('4o-mini')) return 'gpt-4o-mini'
  if (m.includes('4o'))      return 'gpt-4o'
  return m.split('-')[0] || '—'
})

const modelSwitched = computed(() => {
  const models = props.lane.events
    .filter(e => e.event_type === 'THOUGHT')
    .map(e => e.payload.model as string | undefined)
    .filter(Boolean)
  return new Set(models).size > 1
})
</script>

<template>
  <path :d="branchPath" class="lane-connector" fill="none" />
  <line
    v-for="(seg, i) in laneSegments"
    :key="`${lane.neuron_id}-lane-${i}`"
    :x1="seg.x1"
    :x2="seg.x2"
    :y1="laneY"
    :y2="laneY"
    stroke-linecap="round"
    :class="laneLineClass"
  />
  <!-- Lane label: neuron_id + spawn model + switch indicator -->
  <text :x="branchX + 88" :y="laneY - 10" class="lane-label">
    {{ lane.neuron_id }}
    <tspan v-if="spawnModel !== '—'" class="lane-label-detail"> [{{ spawnModel }}]</tspan>
    <tspan v-if="modelSwitched" class="lane-label-warn"> ↔</tspan>
  </text>
  <CanvasNode
    v-for="event in visibleEvents"
    :key="event.id"
    :event="event"
    :darwin-id="darwinId"
    :x="timestampToX(event.timestamp_ms)"
    :y="laneY"
  />
  <path v-if="mergePath" :d="mergePath" class="lane-connector" fill="none" />
</template>
