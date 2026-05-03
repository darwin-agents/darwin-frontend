<script setup lang="ts">
import type { NeuronLane } from '~/types/canvas'
import type { DarwinEvent } from '~/types/events'
import { useCanvasLayout } from '~/composables/useCanvasLayout'
import CanvasNode from '~/components/canvas/CanvasNode.vue'

const props = defineProps<{
  lane: NeuronLane
  laneIndex: number
  visibleEvents: DarwinEvent[]
  darwinId: string
}>()

const { timestampToX, totalWidthPx, trunkY, laneHeight } = useCanvasLayout()

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

const lineEnd = computed(() => endX.value ?? totalWidthPx.value)

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
    :x1="branchX + 80"
    :x2="lineEnd"
    :y1="laneY"
    :y2="laneY"
    :class="laneLineClass"
  />
  <!-- Lane label: neuron_id + spawn model + switch indicator -->
  <text
    :x="branchX + 88"
    :y="laneY - 10"
    class="lane-label fill-slate-400 font-mono text-[9px]"
  >
    {{ lane.neuron_id }}
    <tspan v-if="spawnModel !== '—'" class="fill-slate-300"> [{{ spawnModel }}]</tspan>
    <tspan v-if="modelSwitched" class="fill-amber-400"> ↔</tspan>
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
