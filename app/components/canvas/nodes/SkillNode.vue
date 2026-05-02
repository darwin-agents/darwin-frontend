<script setup lang="ts">
import { Star } from 'lucide-vue-next'
import type { DarwinEvent } from '~/types/events'
import NodeShell from '~/components/canvas/NodeShell.vue'

defineProps<{ event: DarwinEvent }>()
</script>

<template>
  <g>
    <NodeShell :event="event" accent="#f59e0b" label="Skill" />
    <foreignObject x="-10" y="-10" width="20" height="20">
      <Star class="text-amber-400" :size="14" style="display: block; margin: auto" />
    </foreignObject>
  </g>
</template>
