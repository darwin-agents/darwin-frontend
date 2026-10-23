<script setup lang="ts">
import {
  Plus, LogOut, Eye, Loader2,
  Activity, Moon, Skull, Clock,
  TrendingDown, Zap,
} from 'lucide-vue-next'
import type { AgentStateApi } from '~/types/agent'

definePageMeta({ layout: false })
const { t, locale } = useI18n()
const localePath = useLocalePath()
useHead({ title: () => t('dashboard.pageTitle') })

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
    error.value = e instanceof Error ? e.message : t('dashboard.loadFailed')
    agents.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)

type StateConfig = { icon: typeof Activity; color: string; bg: string; border: string; key: string }

const PROVISIONING_CONFIG: StateConfig = { icon: Loader2, color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/30', key: 'PROVISIONING' }

const stateConfig: Record<string, StateConfig> = {
  ACTIVE:       { icon: Activity, color: 'text-darwin-accent', bg: 'bg-darwin-accent/10', border: 'border-darwin-accent/30', key: 'ACTIVE' },
  HIBERNATING:  { icon: Moon,     color: 'text-darwin-muted',  bg: 'bg-darwin-bg-3',      border: 'border-darwin-border',   key: 'HIBERNATING' },
  TERMINATED:   { icon: Skull,    color: 'text-red-600',       bg: 'bg-red-500/10',        border: 'border-red-500/30',      key: 'TERMINATED' },
  PROVISIONING: PROVISIONING_CONFIG,
}

function getStateConfig(s: string): StateConfig {
  return stateConfig[s] ?? PROVISIONING_CONFIG
}

function formatRelativeTime(dateStr: string | null) {
  if (!dateStr) return t('dashboard.never')
  const rtf = new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' })
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return rtf.format(0, 'second')
  if (mins < 60) return rtf.format(-mins, 'minute')
  const hours = Math.floor(mins / 60)
  if (hours < 24) return rtf.format(-hours, 'hour')
  return rtf.format(-Math.floor(hours / 24), 'day')
}

function usd(v: number | null | undefined) {
  return (v ?? 0).toLocaleString(locale.value, { style: 'currency', currency: 'USD' })
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
          <NuxtLink :to="localePath('/')" class="flex items-center gap-2">
            <UiDarwinLogo :size="28" />
          </NuxtLink>
          <div class="h-4 w-px bg-darwin-border" />
          <h1 class="text-sm font-medium text-darwin-ink">{{ t('dashboard.heading') }}</h1>
        </div>
        <div class="flex items-center gap-2">
          <UiInstallButton class="text-darwin-ink" />
          <UiLocaleSwitcher class="text-darwin-ink" />
          <NuxtLink to="/spawn" class="darwin-btn-primary text-xs py-2">
            <Plus :size="14" />
            {{ t('dashboard.spawn') }}
          </NuxtLink>
          <button type="button" class="darwin-btn-ghost text-xs py-2" :aria-label="t('dashboard.signOut')" :title="t('dashboard.signOut')" @click="auth.logout()">
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
        <button type="button" class="darwin-btn-secondary text-xs" @click="load">{{ t('dashboard.retry') }}</button>
      </div>

      <!-- Empty state -->
      <div v-else-if="!agents.length" class="text-center py-20">
        <div
          class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style="background: var(--darwin-bg-2); border: 1px solid var(--darwin-border)"
        >
          <UiDarwinLogo :size="28" mono class="text-darwin-muted" />
        </div>
        <h2 class="text-lg font-semibold text-darwin-ink mb-2">{{ t('dashboard.empty.title') }}</h2>
        <p class="text-sm text-darwin-muted mb-6 max-w-sm mx-auto">
          {{ t('dashboard.empty.body') }}
        </p>
        <NuxtLink to="/spawn" class="darwin-btn-primary">
          <Plus :size="16" />
          {{ t('dashboard.empty.cta') }}
        </NuxtLink>
      </div>

      <!-- Agent list -->
      <div v-else class="space-y-3">
        <div class="flex items-center justify-between mb-2">
          <p class="text-xs text-darwin-muted">{{ agents.length === 1 ? t('dashboard.agentCountOne') : t('dashboard.agentCount', { count: agents.length.toLocaleString(locale) }) }}</p>
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
              >{{ t(`dashboard.states.${getStateConfig(a.state).key}`) }}</span>
            </div>
            <div class="flex items-center gap-4 text-xs text-darwin-muted">
              <span class="flex items-center gap-1">
                <TrendingDown :size="11" />
                {{ t('dashboard.remaining', { amount: usd(a.budget_remaining_usd) }) }}
              </span>
              <span v-if="(a.burn_rate_usd_per_hour ?? 0) > 0" class="flex items-center gap-1">
                <Zap :size="11" />
                {{ t('dashboard.burnRate', { amount: usd(a.burn_rate_usd_per_hour) }) }}
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
              {{ t('dashboard.viewCanvas') }}
            </span>
          </div>
        </NuxtLink>
      </div>
    </main>
  </div>
</template>
