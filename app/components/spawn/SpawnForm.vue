<script setup lang="ts">
import {
  User, DollarSign, Wrench, Rocket, ChevronRight, ChevronLeft,
  Loader2, Check, Info,
} from 'lucide-vue-next'

const api = useApi()
const step = ref(1)
const loading = ref(false)
const errorMsg = ref('')

const form = reactive({
  name: '',
  directive: '',
  model: 'claude-sonnet-4-6',
  budget: 50,
  tools: {
    browser: true,
    finance: true,
    code: false,
  },
})

const models = [
  { id: 'claude-sonnet-4-6',  label: 'Claude Sonnet 4.6',  note: 'Balanced — recommended',         color: 'border-model-sonnet/40 bg-model-sonnet/10' },
  { id: 'claude-haiku-4-5',   label: 'Claude Haiku 4.5',   note: 'Fast — cheapest',                color: 'border-model-haiku/40 bg-model-haiku/10' },
  { id: 'claude-opus-4-6',    label: 'Claude Opus 4.6',    note: 'Highest intelligence — expensive', color: 'border-model-opus/40 bg-model-opus/10' },
  { id: 'gpt-4o',             label: 'GPT-4o',             note: 'Best vision capabilities',        color: 'border-model-gpt4o/40 bg-model-gpt4o/10' },
  { id: 'gpt-4o-mini',        label: 'GPT-4o Mini',        note: 'Fast vision — low cost',          color: 'border-model-gpt4omini/40 bg-model-gpt4omini/10' },
]

const toolDefs = [
  { key: 'browser' as const,  label: 'Browser',  desc: 'Navigate, click, type, screenshot. Full Browserbase sessions.' },
  { key: 'finance' as const,  label: 'Finance',   desc: 'Virtual credit card, bank transfers, crypto transactions.' },
  { key: 'code' as const,     label: 'Code',      desc: 'Read, write, and execute code in sandboxed environments.' },
]

const steps = [
  { num: 1, label: 'Identity', icon: User },
  { num: 2, label: 'Budget',   icon: DollarSign },
  { num: 3, label: 'Tools',    icon: Wrench },
  { num: 4, label: 'Review',   icon: Rocket },
]

const promptPreview = computed(() => form.directive.slice(0, 400))
const selectedModel = computed(() => models.find(m => m.id === form.model))
const enabledTools = computed(() =>
  Object.entries(form.tools).filter(([, on]) => on).map(([k]) => k),
)

const canProceed = computed(() => {
  if (step.value === 1) {
    const name = form.name.trim()
    const directive = form.directive.trim()
    return name.length >= 1 && name.length <= 100 && directive.length >= 10
  }
  return true
})

async function deploy() {
  const name = form.name.trim()
  const directive = form.directive.trim()
  if (name.length < 1 || name.length > 100) {
    errorMsg.value = 'Agent name must be between 1 and 100 characters.'
    return
  }
  if (directive.length < 10) {
    errorMsg.value = 'Directive must be at least 10 characters.'
    return
  }

  loading.value = true
  errorMsg.value = ''
  try {
    const res = await api.post<{ darwin_id: string; session_id: string; state: string }>(
      '/darwins/spawn',
      {
        name,
        directive,
        llm_model: form.model,
        initial_budget: form.budget,
        /** Opaque vault ref; replace when POST /users/{id}/vault is wired in the UI */
        vcc_ref: '__unprovisioned__',
        tool_set: enabledTools.value,
        requires_approval: true,
      },
    )
    const agentStore = useAgentStore()
    agentStore.setInitialBudgetFromSpawn(form.budget)
    if (res.darwin_id) await navigateTo(`/canvas/${res.darwin_id}`)
  } catch (e: any) {
    const detail = e?.data?.detail
    if (Array.isArray(detail) && detail.length) {
      const first = detail[0]
      const field = Array.isArray(first?.loc) ? String(first.loc[first.loc.length - 1]) : 'field'
      const msg = typeof first?.msg === 'string' ? first.msg : 'invalid value'
      errorMsg.value = `Spawn validation failed: ${field} ${msg}`
    } else {
      errorMsg.value = e instanceof Error ? e.message : 'Spawn failed'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-6">
    <!-- Stepper -->
    <nav class="flex items-center gap-1 mb-10">
      <template v-for="(s, i) in steps" :key="s.num">
        <button
          type="button"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all"
          :class="step === s.num
            ? 'bg-violet-500/10 text-violet-300 border border-violet-500/20'
            : step > s.num
              ? 'text-slate-400'
              : 'text-slate-600'"
          @click="s.num < step ? step = s.num : null"
        >
          <div
            class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0"
            :class="step > s.num
              ? 'bg-violet-600 text-white'
              : step === s.num
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                : 'bg-white/[0.04] text-slate-600 border border-white/[0.08]'"
          >
            <Check v-if="step > s.num" :size="10" />
            <span v-else>{{ s.num }}</span>
          </div>
          <span class="hidden sm:inline">{{ s.label }}</span>
        </button>
        <ChevronRight v-if="i < steps.length - 1" :size="12" class="text-slate-700 shrink-0" />
      </template>
    </nav>

    <!-- Step 1: Identity -->
    <div v-if="step === 1" class="space-y-5 animate-fade-in">
      <div>
        <h2 class="text-lg font-semibold text-white mb-1">Identity</h2>
        <p class="text-sm text-slate-500">Name your agent and define its mission.</p>
      </div>

      <div>
        <label class="text-xs text-slate-500 mb-1.5 block">Agent name</label>
        <input v-model="form.name" placeholder="e.g. Market Scout Alpha" class="darwin-input" />
      </div>

      <div>
        <label class="text-xs text-slate-500 mb-1.5 block">Mission directive</label>
        <textarea
          v-model="form.directive"
          placeholder="Describe what this agent should accomplish..."
          class="darwin-input min-h-[160px] resize-y"
        />
        <p class="text-[11px] text-slate-600 mt-1.5">
          This becomes the seed of the agent's system prompt. Be specific about goals and constraints (minimum 10 characters).
        </p>
      </div>

      <div>
        <label class="text-xs text-slate-500 mb-2 block">LLM model (trunk default)</label>
        <div class="space-y-2">
          <label
            v-for="m in models"
            :key="m.id"
            class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all"
            :class="form.model === m.id
              ? m.color + ' border'
              : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'"
          >
            <input v-model="form.model" type="radio" :value="m.id" class="accent-violet-600" />
            <div class="flex-1">
              <span class="text-sm text-white">{{ m.label }}</span>
              <span class="text-xs text-slate-500 ml-2">{{ m.note }}</span>
            </div>
          </label>
        </div>
        <div class="flex items-start gap-2 mt-3 text-[11px] text-slate-600">
          <Info :size="12" class="shrink-0 mt-0.5" />
          <span>The agent may upgrade or downgrade this model per neuron or thought based on task complexity.</span>
        </div>
      </div>
    </div>

    <!-- Step 2: Budget -->
    <div v-if="step === 2" class="space-y-5 animate-fade-in">
      <div>
        <h2 class="text-lg font-semibold text-white mb-1">Budget</h2>
        <p class="text-sm text-slate-500">Set the spending cap for this agent.</p>
      </div>

      <div class="darwin-card p-6">
        <div class="flex items-baseline justify-between mb-4">
          <label class="text-xs text-slate-500">Initial budget</label>
          <span class="text-2xl font-semibold text-white font-mono">${{ form.budget }}</span>
        </div>
        <input
          v-model.number="form.budget"
          type="range"
          min="5"
          max="500"
          step="5"
          class="w-full accent-violet-600 cursor-pointer"
        />
        <div class="flex justify-between text-[10px] text-slate-600 mt-1">
          <span>$5</span>
          <span>$500</span>
        </div>
      </div>

      <div class="flex items-start gap-2 text-[11px] text-slate-600 bg-white/[0.02] rounded-lg p-3 border border-white/[0.06]">
        <Info :size="12" class="shrink-0 mt-0.5" />
        <span>Charges are hard-capped by the Visa network when a VCC is configured. The agent cannot exceed this budget.</span>
      </div>
    </div>

    <!-- Step 3: Tools -->
    <div v-if="step === 3" class="space-y-5 animate-fade-in">
      <div>
        <h2 class="text-lg font-semibold text-white mb-1">Tools</h2>
        <p class="text-sm text-slate-500">Select which capabilities the agent has access to.</p>
      </div>

      <div class="space-y-2">
        <label
          v-for="t in toolDefs"
          :key="t.key"
          class="flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all"
          :class="form.tools[t.key]
            ? 'border-violet-500/20 bg-violet-500/[0.04]'
            : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'"
        >
          <div>
            <p class="text-sm font-medium text-white">{{ t.label }}</p>
            <p class="text-xs text-slate-500 mt-0.5">{{ t.desc }}</p>
          </div>
          <div
            class="w-9 h-5 rounded-full relative transition-colors cursor-pointer shrink-0 ml-4"
            :class="form.tools[t.key] ? 'bg-violet-600' : 'bg-white/10'"
            @click.prevent="form.tools[t.key] = !form.tools[t.key]"
          >
            <span
              class="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform"
              :class="form.tools[t.key] ? 'translate-x-[18px]' : 'translate-x-0.5'"
            />
          </div>
          <input v-model="form.tools[t.key]" type="checkbox" class="sr-only" />
        </label>
      </div>
    </div>

    <!-- Step 4: Review -->
    <div v-if="step === 4" class="space-y-5 animate-fade-in">
      <div>
        <h2 class="text-lg font-semibold text-white mb-1">Review & Deploy</h2>
        <p class="text-sm text-slate-500">Confirm the configuration before spawning.</p>
      </div>

      <div class="darwin-card divide-y divide-white/[0.06]">
        <div class="p-4 flex items-center justify-between">
          <span class="text-xs text-slate-500">Name</span>
          <span class="text-sm text-white font-medium">{{ form.name }}</span>
        </div>
        <div class="p-4 flex items-center justify-between">
          <span class="text-xs text-slate-500">Model</span>
          <span class="text-sm text-white">{{ selectedModel?.label }}</span>
        </div>
        <div class="p-4 flex items-center justify-between">
          <span class="text-xs text-slate-500">Budget</span>
          <span class="text-sm text-white font-mono">${{ form.budget }}</span>
        </div>
        <div class="p-4 flex items-center justify-between">
          <span class="text-xs text-slate-500">Tools</span>
          <div class="flex gap-1.5">
            <span
              v-for="t in enabledTools"
              :key="t"
              class="darwin-badge text-violet-300 bg-violet-500/10 border-violet-500/20"
            >{{ t }}</span>
          </div>
        </div>
        <div class="p-4">
          <span class="text-xs text-slate-500 block mb-2">Directive preview</span>
          <pre class="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-32 overflow-auto font-mono">{{ promptPreview || '—' }}</pre>
        </div>
      </div>

      <div v-if="errorMsg" class="rounded-lg px-3 py-2.5 text-xs bg-red-500/[0.08] text-red-300 border border-red-500/20">
        {{ errorMsg }}
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.06]">
      <button
        v-if="step > 1"
        type="button"
        class="darwin-btn-ghost"
        @click="step--"
      >
        <ChevronLeft :size="16" />
        Back
      </button>
      <NuxtLink v-else to="/dashboard" class="darwin-btn-ghost text-xs">Cancel</NuxtLink>

      <button
        v-if="step < 4"
        type="button"
        class="darwin-btn-primary"
        :disabled="!canProceed"
        @click="step++"
      >
        Continue
        <ChevronRight :size="16" />
      </button>
      <button
        v-else
        type="button"
        class="darwin-btn-primary"
        :disabled="loading"
        @click="deploy"
      >
        <Loader2 v-if="loading" :size="16" class="animate-spin" />
        <Rocket v-else :size="16" />
        {{ loading ? 'Deploying...' : 'Deploy Agent' }}
      </button>
    </div>
  </div>
</template>
