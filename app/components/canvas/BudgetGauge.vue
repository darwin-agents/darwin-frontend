<script setup lang="ts">
const agent = useAgentStore()

const barWidth = computed(() => `${Math.max(0, agent.pctRemaining)}%`)
const barColor = computed(() => {
  if (agent.pctRemaining > 50) return 'bg-green-500'
  if (agent.pctRemaining > 20) return 'bg-amber-500'
  return 'bg-red-500'
})
</script>

<template>
  <div class="flex items-center gap-3 px-4 py-2 flex-1 min-w-0">
    <span class="text-xs text-slate-400 whitespace-nowrap font-mono">${{ agent.balance.toFixed(2) }}</span>
    <div class="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden min-w-[80px]">
      <div class="h-full rounded-full transition-all duration-500" :class="barColor" :style="{ width: barWidth }" />
    </div>
    <span class="text-xs text-slate-400 whitespace-nowrap font-mono">
      ${{ (agent.agent?.initial_budget ?? agent.balance).toFixed(2) }}
    </span>
  </div>
</template>
