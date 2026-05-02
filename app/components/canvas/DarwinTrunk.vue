<script setup lang="ts">
import type { DarwinEvent } from '~/types/events'
import { useCanvasStore } from '~/stores/canvas'
import { useCanvasLayout } from '~/composables/useCanvasLayout'
import CanvasNode from '~/components/canvas/CanvasNode.vue'

defineProps<{
  events: DarwinEvent[]
  darwinId: string
}>()

const canvas = useCanvasStore()
const { timestampToX, totalWidthPx, trunkY } = useCanvasLayout()

const agent = useAgentStore()

const trunkClass = computed(() => ({
  'trunk-active': agent.isActive,
  'trunk-hibernating': agent.isHibernating,
  'trunk-terminated': agent.isTerminated,
}))
</script>

<template>
  <line
    :x1="0"
    :x2="totalWidthPx"
    :y1="trunkY"
    :y2="trunkY"
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
