<script setup lang="ts">
import { Skull } from 'lucide-vue-next'
import type { DarwinEvent } from '~/types/events'
import NodeShell from '~/components/canvas/NodeShell.vue'

defineProps<{ event: DarwinEvent }>()
</script>

<template>
  <g>
    <NodeShell :event="event" accent="#ef4444" label="End" />
    <foreignObject x="-10" y="-10" width="20" height="20">
      <Skull class="text-red-400" :size="14" style="display: block; margin: auto" />
    </foreignObject>
  </g>
</template>
