<script setup lang="ts">
import { TrendingDown, TrendingUp } from 'lucide-vue-next'
import type { DarwinEvent } from '~/types/events'
import NodeShell from '~/components/canvas/NodeShell.vue'

const props = defineProps<{ event: DarwinEvent }>()
const debit = computed(() => props.event.event_type === 'LEDGER_DEBIT')
</script>

<template>
  <g>
    <NodeShell :event="event" :accent="debit ? '#b42318' : '#2f6f4e'" :label="debit ? 'Debit' : 'Credit'" />
    <foreignObject x="-10" y="-10" width="20" height="20">
      <TrendingDown v-if="debit" :size="14" style="display: block; margin: auto; color: #b42318" />
      <TrendingUp v-else :size="14" style="display: block; margin: auto; color: #2f6f4e" />
    </foreignObject>
  </g>
</template>
