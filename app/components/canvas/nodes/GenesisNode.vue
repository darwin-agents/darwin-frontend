<script setup lang="ts">
import { Dna } from 'lucide-vue-next'
import type { DarwinEvent } from '~/types/events'
import NodeShell from '~/components/canvas/NodeShell.vue'

defineProps<{ event: DarwinEvent }>()
</script>

<template>
  <g>
    <NodeShell :event="event" accent="#d9480f" label-id="genesis" />
    <foreignObject x="-10" y="-10" width="20" height="20">
      <Dna class="mx-auto" :size="14" style="display: block; margin: auto; color: #c93f0a" />
    </foreignObject>
  </g>
</template>
