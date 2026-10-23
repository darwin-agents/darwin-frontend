<script setup lang="ts">
import { Star } from 'lucide-vue-next'
import type { DarwinEvent } from '~/types/events'
import NodeShell from '~/components/canvas/NodeShell.vue'

defineProps<{ event: DarwinEvent }>()
</script>

<template>
  <g>
    <NodeShell :event="event" accent="#b45309" label-id="skill" />
    <foreignObject x="-10" y="-10" width="20" height="20">
      <Star :size="14" style="display: block; margin: auto; color: #92400e" />
    </foreignObject>
  </g>
</template>
