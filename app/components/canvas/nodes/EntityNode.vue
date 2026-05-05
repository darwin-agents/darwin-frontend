<script setup lang="ts">
import { Database } from 'lucide-vue-next'
import type { DarwinEvent } from '~/types/events'
import NodeShell from '~/components/canvas/NodeShell.vue'

defineProps<{ event: DarwinEvent }>()
</script>

<template>
  <g>
    <NodeShell :event="event" accent="#0f766e" label="Entity" />
    <foreignObject x="-10" y="-10" width="20" height="20">
      <Database :size="14" style="display: block; margin: auto; color: #0d5c56" />
    </foreignObject>
  </g>
</template>
