<script setup lang="ts">
import {
  ChevronLeft, Terminal, Database, Star, Receipt, FileBox,
  Activity, Moon, Skull, Loader2,
} from 'lucide-vue-next'

defineProps<{ darwinId: string }>()

const agent = useAgentStore()
const panels = useCanvasPanels()

const stateIcon = computed(() => {
  if (agent.isActive) return Activity
  if (agent.isHibernating) return Moon
  if (agent.isTerminated) return Skull
  return Loader2
})

const stateClass = computed(() => {
  if (agent.isActive)      return 'text-violet-300 bg-violet-500/10 border-violet-500/30'
  if (agent.isHibernating) return 'text-slate-400 bg-slate-500/10 border-slate-500/30'
  if (agent.isTerminated)  return 'text-red-400 bg-red-500/10 border-red-500/30'
  return 'text-amber-300 bg-amber-500/10 border-amber-500/30'
})

const panelButtons = [
  { label: 'Console',  icon: Terminal, toggle: () => panels.toggleConsole(),     active: panels.showCommandConsole },
  { label: 'Entities', icon: Database, toggle: () => panels.toggleEntityPanel(), active: panels.showEntityPanel },
  { label: 'Skills',   icon: Star,     toggle: () => panels.toggleSkillsPanel(), active: panels.showSkillsPanel },
  { label: 'Ledger',   icon: Receipt,  toggle: () => panels.toggleLedgerPanel(), active: panels.showLedgerPanel },
  { label: 'Assets',   icon: FileBox,  toggle: () => panels.toggleAssetsPanel(), active: panels.showAssetsPanel },
]
</script>

<template>
  <header class="shrink-0 border-b border-white/[0.06] bg-darwin-surface/80 backdrop-blur-xl flex items-center gap-3 px-3 py-2.5 z-30">
    <!-- Back -->
    <NuxtLink to="/dashboard" class="text-slate-500 hover:text-slate-300 transition-colors p-1">
      <ChevronLeft :size="16" />
    </NuxtLink>

    <div class="h-4 w-px bg-white/[0.06]" />

    <!-- Agent info -->
    <div class="min-w-0 flex items-center gap-2.5">
      <div class="min-w-0">
        <p class="text-sm font-medium text-white truncate leading-tight">{{ agent.agent?.name ?? 'Agent' }}</p>
        <p class="text-[10px] text-slate-600 font-mono truncate">{{ darwinId.slice(0, 12) }}…</p>
      </div>
      <span class="darwin-badge border" :class="stateClass">
        <component :is="stateIcon" :size="10" class="mr-1" :class="agent.state === 'PROVISIONING' ? 'animate-spin' : ''" />
        {{ agent.state }}
      </span>
    </div>

    <!-- Budget gauge -->
    <CanvasBudgetGauge class="border-0 flex-1 min-w-0" />

    <!-- Heartbeat sparkline -->
    <CanvasHeartbeatBar />

    <div class="h-4 w-px bg-white/[0.06]" />

    <!-- Panel toggles -->
    <div class="flex items-center gap-1">
      <button
        v-for="pb in panelButtons"
        :key="pb.label"
        type="button"
        class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-all"
        :class="pb.active.value
          ? 'bg-violet-500/10 text-violet-300 border border-violet-500/20'
          : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'"
        @click="pb.toggle()"
      >
        <component :is="pb.icon" :size="13" />
        <span class="hidden lg:inline">{{ pb.label }}</span>
      </button>
    </div>
  </header>
</template>
