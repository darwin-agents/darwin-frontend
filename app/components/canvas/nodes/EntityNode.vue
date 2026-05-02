<script setup lang="ts">
import { Database } from 'lucide-vue-next'
import type { DarwinEvent } from '~/types/events'
import NodeShell from '~/components/canvas/NodeShell.vue'

defineProps<{ event: DarwinEvent }>()
</script>

<template>
  <g>
    <NodeShell :event="event" accent="#06b6d4" label="Entity" />
    <foreignObject x="-10" y="-10" width="20" height="20">
      <Database class="text-cyan-400" :size="14" style="display: block; margin: auto" />
    </foreignObject>
  </g>
</template>
