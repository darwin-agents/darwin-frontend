<script setup lang="ts">
import { Zap } from 'lucide-vue-next'
import type { DarwinEvent } from '~/types/events'
import NodeShell from '~/components/canvas/NodeShell.vue'

defineProps<{ event: DarwinEvent }>()
</script>

<template>
  <g>
    <NodeShell :event="event" accent="#2f6f4e" label="Wake" />
    <foreignObject x="-10" y="-10" width="20" height="20">
      <Zap :size="14" style="display: block; margin: auto; color: #276045" />
    </foreignObject>
  </g>
</template>
