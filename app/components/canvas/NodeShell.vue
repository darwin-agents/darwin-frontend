<script setup lang="ts">
import type { DarwinEvent } from '~/types/events'

const props = defineProps<{
  event: DarwinEvent
  accent: string
  label: string
  pulse?: boolean
}>()

const cost = computed(() => {
  const t = props.event.token_cost ?? props.event.fiat_cost
  if (t == null || t <= 0) return null
  return `$${Number(t).toFixed(3)}`
})
</script>

<template>
  <g class="select-none">
    <circle
      r="18"
      :class="pulse ? 'animate-pulse' : ''"
      :fill="`${accent}33`"
      :stroke="accent"
      stroke-width="1.5"
    />
    <text x="0" y="4" text-anchor="middle" class="fill-slate-200 font-mono text-[9px]">
      {{ label }}
    </text>
    <text v-if="cost" x="0" y="28" text-anchor="middle" class="fill-slate-500 font-mono text-[8px]">
      {{ cost }}
    </text>
  </g>
</template>
