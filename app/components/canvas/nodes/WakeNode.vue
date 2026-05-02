<script setup lang="ts">
import { Zap } from 'lucide-vue-next'
import type { DarwinEvent } from '~/types/events'
import NodeShell from '~/components/canvas/NodeShell.vue'

defineProps<{ event: DarwinEvent }>()
</script>

<template>
  <g>
    <NodeShell :event="event" accent="#22c55e" label="Wake" />
    <foreignObject x="-10" y="-10" width="20" height="20">
      <Zap class="text-green-400" :size="14" style="display: block; margin: auto" />
    </foreignObject>
  </g>
</template>
