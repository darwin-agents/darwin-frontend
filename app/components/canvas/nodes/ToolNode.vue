<script setup lang="ts">
import { Wrench } from 'lucide-vue-next'
import type { DarwinEvent } from '~/types/events'
import NodeShell from '~/components/canvas/NodeShell.vue'

const props = defineProps<{ event: DarwinEvent }>()

const accent = computed(() => {
  if (props.event.event_type === 'NEURON_FAILED') return '#ef4444'
  const p = props.event.payload as { status?: string }
  if (p?.status === 'failure') return '#ef4444'
  if (p?.status === 'retry') return '#f59e0b'
  return '#22c55e'
})
</script>

<template>
  <g>
    <NodeShell :event="event" :accent="accent" label="Tool" />
    <foreignObject x="-10" y="-10" width="20" height="20">
      <Wrench class="text-emerald-400" :size="14" style="display: block; margin: auto" />
    </foreignObject>
  </g>
</template>
