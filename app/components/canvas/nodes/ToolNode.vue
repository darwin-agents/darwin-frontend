<script setup lang="ts">
import { Wrench } from 'lucide-vue-next'
import type { DarwinEvent } from '~/types/events'
import NodeShell from '~/components/canvas/NodeShell.vue'

const props = defineProps<{ event: DarwinEvent }>()

const accent = computed(() => {
  if (props.event.event_type === 'NEURON_FAILED') return '#b42318'
  const p = props.event.payload as { status?: string }
  if (p?.status === 'failure') return '#b42318'
  if (p?.status === 'retry') return '#a16207'
  return '#2f6f4e'
})
</script>

<template>
  <g>
    <NodeShell :event="event" :accent="accent" label-id="tool" />
    <foreignObject x="-10" y="-10" width="20" height="20">
      <Wrench :size="14" :style="{ display: 'block', margin: 'auto', color: accent }" />
    </foreignObject>
  </g>
</template>
