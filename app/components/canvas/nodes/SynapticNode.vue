<script setup lang="ts">
import { GitMerge } from 'lucide-vue-next'
import type { DarwinEvent } from '~/types/events'
import NodeShell from '~/components/canvas/NodeShell.vue'

defineProps<{ event: DarwinEvent }>()
</script>

<template>
  <g>
    <NodeShell :event="event" accent="#185FA5" label="Synthesis" />
    <foreignObject x="-10" y="-10" width="20" height="20">
      <GitMerge :size="14" style="display: block; margin: auto; color: #134b84" />
    </foreignObject>
  </g>
</template>
