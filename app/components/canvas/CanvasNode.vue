<script setup lang="ts">
import type { Component } from 'vue'
import type { DarwinEvent } from '~/types/events'
import { useCanvasStore } from '~/stores/canvas'
import GenesisNode from '~/components/canvas/nodes/GenesisNode.vue'
import ThoughtNode from '~/components/canvas/nodes/ThoughtNode.vue'
import ToolNode from '~/components/canvas/nodes/ToolNode.vue'
import FinancialNode from '~/components/canvas/nodes/FinancialNode.vue'
import SkillNode from '~/components/canvas/nodes/SkillNode.vue'
import EntityNode from '~/components/canvas/nodes/EntityNode.vue'
import MemoryNode from '~/components/canvas/nodes/MemoryNode.vue'
import InterventionNode from '~/components/canvas/nodes/InterventionNode.vue'
import SynapticNode from '~/components/canvas/nodes/SynapticNode.vue'
import WakeNode from '~/components/canvas/nodes/WakeNode.vue'
import HibernateNode from '~/components/canvas/nodes/HibernateNode.vue'
import TerminatedNode from '~/components/canvas/nodes/TerminatedNode.vue'

const props = defineProps<{
  event: DarwinEvent
  x: number
  y: number
  darwinId: string
}>()

const canvas = useCanvasStore()

const nodeComponent = computed(() => {
  const map: Record<string, Component | null> = {
    AGENT_SPAWNED: GenesisNode,
    THOUGHT: ThoughtNode,
    TOOL_CALL: ToolNode,
    TOOL_RESULT: ToolNode,
    BROWSER_SCREENSHOT: ToolNode,
    LEDGER_DEBIT: FinancialNode,
    LEDGER_CREDIT: FinancialNode,
    SKILL_CREATED: SkillNode,
    SKILL_LOADED: SkillNode,
    ENTITY_CREATED: EntityNode,
    ENTITY_UPDATED: EntityNode,
    EPISODIC_SUMMARY_WRITTEN: MemoryNode,
    ASK_HUMAN_SENT: InterventionNode,
    ASK_HUMAN_RESOLVED: InterventionNode,
    APPROVAL_REQUESTED: InterventionNode,
    APPROVAL_GRANTED: InterventionNode,
    APPROVAL_DENIED: InterventionNode,
    CAPTCHA_DELEGATED: InterventionNode,
    NEURON_SPAWNED: null,
    NEURON_COMPLETED: ToolNode,
    NEURON_FAILED: ToolNode,
    SYNAPTIC_INTEGRATION: SynapticNode,
    AGENT_WOKE: WakeNode,
    AGENT_HIBERNATED: HibernateNode,
    AGENT_TERMINATED: TerminatedNode,
  }
  // `null` entries are deliberately hidden (e.g. NEURON_SPAWNED is drawn by the lane itself)
  const type = props.event.event_type
  return type in map ? map[type] : ToolNode
})

function onClick() {
  canvas.selectEvent(props.event.id)
}
</script>

<template>
  <g v-if="nodeComponent" :transform="`translate(${x}, ${y})`" class="cursor-pointer canvas-node-root" @click="onClick">
    <circle
      v-if="canvas.selectedEventId === event.id"
      r="29"
      cx="0"
      cy="0"
      fill="none"
      stroke="var(--darwin-accent)"
      stroke-width="2"
      class="pointer-events-none canvas-node-selection-ring"
    />
    <component :is="nodeComponent" :event="event" :darwin-id="darwinId" />
  </g>
</template>
