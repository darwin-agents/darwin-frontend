<script setup lang="ts">
import { TrendingDown, TrendingUp } from 'lucide-vue-next'
import type { DarwinEvent } from '~/types/events'
import NodeShell from '~/components/canvas/NodeShell.vue'

const props = defineProps<{ event: DarwinEvent }>()
const debit = computed(() => props.event.event_type === 'LEDGER_DEBIT')
</script>

<template>
  <g>
    <NodeShell :event="event" :accent="debit ? '#ef4444' : '#22c55e'" :label="debit ? 'Debit' : 'Credit'" />
    <foreignObject x="-10" y="-10" width="20" height="20">
      <TrendingDown v-if="debit" class="text-red-400" :size="14" style="display: block; margin: auto" />
      <TrendingUp v-else class="text-green-400" :size="14" style="display: block; margin: auto" />
    </foreignObject>
  </g>
</template>
