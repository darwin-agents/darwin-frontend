<script setup lang="ts">
import { Moon } from 'lucide-vue-next'
import type { DarwinEvent } from '~/types/events'
import NodeShell from '~/components/canvas/NodeShell.vue'

defineProps<{ event: DarwinEvent }>()
</script>

<template>
  <g>
    <NodeShell :event="event" accent="#64748b" label="Rest" />
    <foreignObject x="-10" y="-10" width="20" height="20">
      <Moon class="text-slate-400" :size="14" style="display: block; margin: auto" />
    </foreignObject>
  </g>
</template>
