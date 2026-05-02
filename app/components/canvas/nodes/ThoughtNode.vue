<script setup lang="ts">
import { Brain } from 'lucide-vue-next'
import type { DarwinEvent } from '~/types/events'
import NodeShell from '~/components/canvas/NodeShell.vue'

defineProps<{ event: DarwinEvent }>()
</script>

<template>
  <g>
    <NodeShell :event="event" accent="#8b5cf6" label="Thought" />
    <foreignObject x="-10" y="-10" width="20" height="20">
      <Brain class="text-violet-400" :size="14" style="display: block; margin: auto" />
    </foreignObject>
  </g>
</template>
