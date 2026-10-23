<script setup lang="ts">
import type { DarwinEvent } from '~/types/events'

const props = defineProps<{
  event: DarwinEvent
  accent: string
  labelId: string
  pulse?: boolean
}>()

const { t } = useI18n()

const cost = computed(() => {
  const t = props.event.token_cost ?? props.event.fiat_cost
  if (t == null || t <= 0) return null
  return `$${Number(t).toFixed(3)}`
})
</script>

<template>
  <g class="select-none canvas-node-shell">
    <circle
      r="20"
      :class="pulse ? 'animate-pulse' : ''"
      :fill="`${accent}26`"
      :stroke="accent"
      stroke-width="1.25"
      class="transition-[r,stroke-width] duration-200 ease-out"
    />
    <circle r="20" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="1" pointer-events="none" />
    <text x="0" y="4" text-anchor="middle" class="canvas-node-title text-[9px] font-medium">
      {{ t(`canvas.nodes.${labelId}`) }}
    </text>
    <text v-if="cost" x="0" y="29" text-anchor="middle" class="canvas-node-cost text-[8px]">
      {{ cost }}
    </text>
  </g>
</template>
