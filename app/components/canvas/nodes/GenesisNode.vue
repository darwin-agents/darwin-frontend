<script setup lang="ts">
import { Dna } from 'lucide-vue-next'
import type { DarwinEvent } from '~/types/events'
import NodeShell from '~/components/canvas/NodeShell.vue'

defineProps<{ event: DarwinEvent }>()
</script>

<template>
  <g>
    <NodeShell :event="event" accent="#6366f1" label="Genesis" />
    <foreignObject x="-10" y="-10" width="20" height="20">
      <Dna class="text-indigo-400 mx-auto" :size="14" style="display: block; margin: auto" />
    </foreignObject>
  </g>
</template>
