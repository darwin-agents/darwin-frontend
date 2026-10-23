<script setup lang="ts">
import {
  Plus, LogOut, Eye, Loader2,
  Activity, Moon, Skull, Clock,
  TrendingDown, Zap,
} from 'lucide-vue-next'
import type { AgentStateApi } from '~/types/agent'

definePageMeta({ layout: false })
useHead({ title: 'Dashboard' })

const auth = useAuthStore()
const api = useApi()
const agents = ref<AgentStateApi[]>([])
const error = ref<string | null>(null)
const loading = ref(true)

async function load() {
  error.value = null
  loading.value = true
  const uid = auth.userId
  if (!uid) { loading.value = false; return }
  try {
    const res = await api.get<{ agents: AgentStateApi[]; total: number }>('/darwins/', {
      owner_id: uid,
    })
    agents.value = res.agents ?? []
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load agents'
    agents.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)

type StateConfig = { icon: typeof Activity; color: string; bg: string; border: string; label: string }

const PROVISIONING_CONFIG: StateConfig = { icon: Loader2, color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Provisioning' }

const stateConfig: Record<string, StateConfig> = {
  ACTIVE:       { icon: Activity, color: 'text-darwin-accent', bg: 'bg-darwin-accent/10', border: 'border-darwin-accent/30', label: 'Active' },
  HIBERNATING:  { icon: Moon,     color: 'text-darwin-muted',  bg: 'bg-darwin-bg-3',      border: 'border-darwin-border',   label: 'Hibernating' },
  TERMINATED:   { icon: Skull,    color: 'text-red-600',       bg: 'bg-red-500/10',        border: 'border-red-500/30',      label: 'Terminated' },
  PROVISIONING: PROVISIONING_CONFIG,
}

function getStateConfig(s: string): StateConfig {
  return stateConfig[s] ?? PROVISIONING_CONFIG
}

function formatRelativeTime(dateStr: string | null) {
  if (!dateStr) return 'Never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
</script>

<template>
  <div class="min-h-screen bg-darwin-bg">
    <!-- Header -->
    <header
      class="sticky top-0 z-30 backdrop-blur-xl"
      style="background: rgba(243,238,226,0.8); border-bottom: 1px solid var(--darwin-border)"
    >
      <div class="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 22 22">
              <circle cx="11" cy="11" r="10" fill="none" stroke="var(--darwin-ink)" stroke-width="1.4" />
              <circle cx="11" cy="11" r="3.5" fill="var(--darwin-accent)" />
            </svg>
          </NuxtLink>
          <div class="h-4 w-px bg-darwin-border" />
          <h1 class="text-sm font-medium text-darwin-ink">Dashboard</h1>
        </div>
        <div class="flex items-center gap-2">
          <NuxtLink to="/spawn" class="darwin-btn-primary text-xs py-2">
            <Plus :size="14" />
            Spawn agent
          </NuxtLink>
          <button type="button" class="darwin-btn-ghost text-xs py-2" aria-label="Sign out" title="Sign out" @click="auth.logout()">
            <LogOut :size="14" />
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-6 py-8">
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <Loader2 :size="24" class="text-darwin-accent animate-spin" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="darwin-card p-6 text-center">
        <p class="text-sm text-red-600 mb-3">{{ error }}</p>
        <button type="button" class="darwin-btn-secondary text-xs" @click="load">Retry</button>
      </div>

      <!-- Empty state -->
      <div v-else-if="!agents.length" class="text-center py-20">
        <div
          class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style="background: var(--darwin-bg-2); border: 1px solid var(--darwin-border)"
        >
          <svg width="28" height="28" viewBox="0 0 22 22">
            <circle cx="11" cy="11" r="10" fill="none" stroke="var(--darwin-muted)" stroke-width="1.4" />
            <circle cx="11" cy="11" r="3.5" fill="var(--darwin-muted)" />
          </svg>
        </div>
        <h2 class="text-lg font-semibold text-darwin-ink mb-2">No agents yet</h2>
        <p class="text-sm text-darwin-muted mb-6 max-w-sm mx-auto">
          Spawn your first autonomous agent to start visualizing its lifecycle on the infinite canvas.
        </p>
        <NuxtLink to="/spawn" class="darwin-btn-primary">
          <Plus :size="16" />
          Spawn your first agent
        </NuxtLink>
      </div>

      <!-- Agent list -->
      <div v-else class="space-y-3">
        <div class="flex items-center justify-between mb-2">
          <p class="text-xs text-darwin-muted">{{ agents.length }} agent{{ agents.length === 1 ? '' : 's' }}</p>
        </div>

        <NuxtLink
          v-for="a in agents"
          :key="a.agent_id"
          :to="`/canvas/${a.agent_id}`"
          class="darwin-card p-5 flex items-center gap-5 group transition-all cursor-pointer block"
          style="text-decoration: none"
          onmouseover="this.style.borderColor='var(--darwin-ink-soft)'"
          onmouseout="this.style.borderColor=''"
        >
          <!-- State indicator -->
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
            :class="[getStateConfig(a.state).bg, getStateConfig(a.state).border]"
          >
            <component
              :is="getStateConfig(a.state).icon"
              :size="18"
              :class="[getStateConfig(a.state).color, a.state === 'PROVISIONING' ? 'animate-spin' : '']"
            />
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <p class="text-sm font-medium text-darwin-ink truncate">{{ a.name }}</p>
              <span
                class="darwin-badge"
                :class="[getStateConfig(a.state).color, getStateConfig(a.state).bg, getStateConfig(a.state).border]"
              >{{ getStateConfig(a.state).label }}</span>
            </div>
            <div class="flex items-center gap-4 text-xs text-darwin-muted">
              <span class="flex items-center gap-1">
                <TrendingDown :size="11" />
                ${{ (a.budget_remaining_usd ?? 0).toFixed(2) }} remaining
              </span>
              <span v-if="(a.burn_rate_usd_per_hour ?? 0) > 0" class="flex items-center gap-1">
                <Zap :size="11" />
                ${{ (a.burn_rate_usd_per_hour ?? 0).toFixed(2) }}/hr
              </span>
              <span class="flex items-center gap-1">
                <Clock :size="11" />
                {{ formatRelativeTime(a.last_active_at) }}
              </span>
            </div>
          </div>

          <!-- View canvas -->
          <div class="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <span class="darwin-btn-ghost text-xs py-1.5 px-3">
              <Eye :size="14" />
              Canvas
            </span>
          </div>
        </NuxtLink>
      </div>
    </main>
  </div>
</template>
