<script setup lang="ts">
import { Skull } from 'lucide-vue-next'
import type { DarwinEvent } from '~/types/events'
import NodeShell from '~/components/canvas/NodeShell.vue'

defineProps<{ event: DarwinEvent }>()
</script>

<template>
  <g>
    <NodeShell :event="event" accent="#991b1b" label-id="end" />
    <foreignObject x="-10" y="-10" width="20" height="20">
      <Skull :size="14" style="display: block; margin: auto; color: #7f1d1d" />
    </foreignObject>
  </g>
</template>
