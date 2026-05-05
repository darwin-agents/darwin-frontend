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
  if (agent.isActive)      return 'text-darwin-accent bg-darwin-accent/10 border-darwin-accent/30'
  if (agent.isHibernating) return 'text-darwin-muted bg-darwin-bg-3 border-darwin-border'
  if (agent.isTerminated)  return 'text-red-700 bg-red-100 border-red-200'
  return 'text-darwin-ink-soft bg-darwin-bg-3 border-darwin-border'
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
  <header class="shrink-0 border-b border-darwin-border bg-darwin-surface/90 backdrop-blur-xl flex items-center gap-3 px-3 py-2.5 z-30">
    <!-- Back -->
    <NuxtLink to="/dashboard" class="text-darwin-muted hover:text-darwin-ink transition-colors p-1">
      <ChevronLeft :size="16" />
    </NuxtLink>

    <div class="h-4 w-px bg-darwin-border" />

    <!-- Agent info -->
    <div class="min-w-0 flex items-center gap-2.5">
      <div class="min-w-0">
        <p class="text-sm font-medium text-darwin-ink truncate leading-tight">{{ agent.agent?.name ?? 'Agent' }}</p>
        <p class="text-[10px] text-darwin-muted font-mono truncate">{{ darwinId.slice(0, 12) }}…</p>
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

    <div class="h-4 w-px bg-darwin-border" />

    <!-- Panel toggles -->
    <div class="flex items-center gap-1">
      <button
        v-for="pb in panelButtons"
        :key="pb.label"
        type="button"
        class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-all"
        :class="pb.active
          ? 'bg-darwin-accent/10 text-darwin-accent border border-darwin-accent/25'
          : 'text-darwin-muted hover:text-darwin-ink hover:bg-darwin-bg-3'"
        @click.stop.prevent="pb.toggle()"
      >
        <component :is="pb.icon" :size="13" />
        <span class="hidden lg:inline">{{ pb.label }}</span>
      </button>
    </div>
  </header>
</template>
