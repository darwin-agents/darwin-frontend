<script setup lang="ts">
defineProps<{ darwinId: string }>()

const agent = useAgentStore()
const panels = useCanvasPanels()
</script>

<template>
  <header class="shrink-0 border-b border-white/10 bg-darwin-surface/90 backdrop-blur flex flex-wrap items-center gap-2 px-2 py-2">
    <NuxtLink to="/dashboard" class="text-xs text-slate-500 hover:text-white px-2">← Dashboard</NuxtLink>
    <div class="min-w-0">
      <p class="text-sm font-medium text-white truncate">{{ agent.agent?.name ?? 'Agent' }}</p>
      <p class="text-[10px] text-slate-500 font-mono">{{ darwinId }}</p>
    </div>
    <span
      class="text-[10px] uppercase px-2 py-0.5 rounded border border-white/10 text-slate-300"
    >{{ agent.state }}</span>
    <BudgetGauge class="border-0 flex-1" />
    <HeartbeatBar />
    <button
      type="button"
      class="darwin-btn-secondary text-xs py-1.5"
      @click="panels.toggleConsole()"
    >
      Console
    </button>
    <button
      type="button"
      class="darwin-btn-ghost text-xs py-1.5"
      @click="panels.toggleEntityPanel()"
    >
      Entities
    </button>
    <button
      type="button"
      class="darwin-btn-ghost text-xs py-1.5"
      @click="panels.toggleSkillsPanel()"
    >
      Skills
    </button>
    <button
      type="button"
      class="darwin-btn-ghost text-xs py-1.5"
      @click="panels.toggleLedgerPanel()"
    >
      Ledger
    </button>
    <button
      type="button"
      class="darwin-btn-ghost text-xs py-1.5"
      @click="panels.toggleAssetsPanel()"
    >
      Assets
    </button>
  </header>
</template>
