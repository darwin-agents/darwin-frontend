<script setup lang="ts">
import type { AgentStateApi } from '~/types/agent'

definePageMeta({ layout: false })

const auth = useAuthStore()
const api = useApi()
const agents = ref<AgentStateApi[]>([])
const error = ref<string | null>(null)

async function load() {
  error.value = null
  const uid = auth.userId
  if (!uid) return
  try {
    const res = await api.get<{ agents: AgentStateApi[]; total: number }>('/darwins/', {
      owner_id: uid,
    })
    agents.value = res.agents ?? []
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load agents'
    agents.value = []
  }
}

onMounted(load)

function stateBadgeClass(s: string) {
  if (s === 'ACTIVE') return 'bg-violet-500/20 text-violet-300 border-violet-500/40'
  if (s === 'HIBERNATING') return 'bg-slate-500/20 text-slate-300 border-slate-500/40'
  if (s === 'TERMINATED') return 'bg-red-900/30 text-red-300 border-red-900/50'
  return 'bg-amber-500/15 text-amber-200 border-amber-500/30'
}
</script>

<template>
  <div class="min-h-screen bg-darwin-bg text-slate-100">
    <header class="border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <h1 class="text-sm font-semibold text-white">Dashboard</h1>
      <div class="flex gap-2">
        <NuxtLink to="/spawn" class="darwin-btn-primary text-xs py-2">Spawn agent</NuxtLink>
        <button type="button" class="darwin-btn-ghost text-xs" @click="auth.logout()">Sign out</button>
      </div>
    </header>
    <main class="p-6 max-w-4xl mx-auto space-y-4">
      <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
      <p v-if="!agents.length && !error" class="text-sm text-slate-500">No agents yet. Spawn one to open a canvas.</p>
      <ul class="space-y-3">
        <li
          v-for="a in agents"
          :key="a.agent_id"
          class="rounded border border-white/10 bg-darwin-surface p-4 flex flex-wrap items-center gap-4 justify-between"
        >
          <div>
            <p class="font-medium text-white">{{ a.name }}</p>
            <p class="text-xs text-slate-500">Balance ${{ a.budget_remaining_usd.toFixed(2) }}</p>
            <p v-if="a.last_active_at" class="text-xs text-slate-600 mt-1">{{ a.last_active_at }}</p>
          </div>
          <span
            class="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border"
            :class="stateBadgeClass(a.state)"
          >{{ a.state }}</span>
          <div class="flex gap-2 w-full sm:w-auto">
            <NuxtLink
              :to="`/canvas/${a.agent_id}`"
              class="darwin-btn-secondary text-xs py-2 flex-1 text-center"
            >Canvas</NuxtLink>
          </div>
        </li>
      </ul>
    </main>
  </div>
</template>
