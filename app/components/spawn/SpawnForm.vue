<script setup lang="ts">
const props = defineProps<{ ownerId: string }>()

const api = useApi()
const step = ref(1)
const loading = ref(false)

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
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', note: 'Balanced · recommended' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5', note: 'Fast · cheapest' },
  { id: 'claude-opus-4-6', label: 'Claude Opus 4.6', note: 'Highest intelligence · most expensive' },
  { id: 'gpt-4o', label: 'GPT-4o', note: 'Best vision capabilities' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini', note: 'Fast vision · low cost' },
]

const promptPreview = computed(() => form.directive.slice(0, 400))

async function deploy() {
  loading.value = true
  try {
    const res = await api.post<{ agent_id: string }>('/darwins/spawn', {
      name: form.name,
      directive: form.directive,
      budget_usd: form.budget,
      owner_id: props.ownerId,
      tags: Object.entries(form.tools)
        .filter(([, on]) => on)
        .map(([k]) => k),
    })
    const agentStore = useAgentStore()
    agentStore.setInitialBudgetFromSpawn(form.budget)
    if (res.agent_id) await navigateTo(`/canvas/${res.agent_id}`)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-xl mx-auto p-6 space-y-6">
    <header class="flex items-center justify-between">
      <h1 class="text-lg font-semibold text-white">Spawn agent</h1>
      <NuxtLink to="/dashboard" class="text-xs text-slate-500 hover:text-white">Cancel</NuxtLink>
    </header>
    <div class="flex gap-2 text-xs">
      <span :class="step === 1 ? 'text-violet-400' : 'text-slate-500'">1 Identity</span>
      <span class="text-slate-600">→</span>
      <span :class="step === 2 ? 'text-violet-400' : 'text-slate-500'">2 Budget</span>
      <span class="text-slate-600">→</span>
      <span :class="step === 3 ? 'text-violet-400' : 'text-slate-500'">3 Tools</span>
      <span class="text-slate-600">→</span>
      <span :class="step === 4 ? 'text-violet-400' : 'text-slate-500'">4 Review</span>
    </div>
    <div v-if="step === 1" class="space-y-3">
      <input v-model="form.name" placeholder="Agent name" class="darwin-input w-full" />
      <textarea v-model="form.directive" placeholder="Mission directive" class="darwin-input w-full min-h-[160px]" />
      <div class="space-y-2">
        <p class="text-xs text-slate-500">LLM model (trunk default)</p>
        <label
          v-for="m in models"
          :key="m.id"
          class="flex items-center gap-2 text-sm text-slate-300"
        >
          <input v-model="form.model" type="radio" :value="m.id" class="accent-violet-600" />
          <span>{{ m.label }}</span>
          <span class="text-xs text-slate-500">— {{ m.note }}</span>
        </label>
        <p class="text-xs text-slate-500 mt-1 pl-5">
          ℹ The agent may upgrade or downgrade this model autonomously per neuron or per thought based on task complexity.
        </p>
      </div>
      <button type="button" class="darwin-btn-primary" @click="step = 2">Continue</button>
    </div>
    <div v-if="step === 2" class="space-y-3">
      <label class="text-sm text-slate-400 flex flex-col gap-2">
        Initial budget (USD)
        <input v-model.number="form.budget" type="range" min="5" max="500" class="w-full accent-violet-600" />
        <span class="text-white font-mono">${{ form.budget }}</span>
      </label>
      <p class="text-xs text-slate-500">Charges are capped by your vault spend limit when configured.</p>
      <div class="flex gap-2">
        <button type="button" class="darwin-btn-ghost" @click="step = 1">Back</button>
        <button type="button" class="darwin-btn-primary" @click="step = 3">Continue</button>
      </div>
    </div>
    <div v-if="step === 3" class="space-y-3">
      <p class="text-xs text-slate-500 uppercase">Tools</p>
      <label
        v-for="key in (['browser', 'finance', 'code'] as const)"
        :key="key"
        class="flex items-center justify-between bg-white/5 rounded p-3"
      >
        <span class="text-sm capitalize text-slate-200">{{ key }}</span>
        <input v-model="form.tools[key]" type="checkbox" class="accent-violet-600" />
      </label>
      <div class="flex gap-2">
        <button type="button" class="darwin-btn-ghost" @click="step = 2">Back</button>
        <button type="button" class="darwin-btn-primary" @click="step = 4">Continue</button>
      </div>
    </div>
    <div v-if="step === 4" class="space-y-3">
      <p class="text-xs text-slate-500">Prompt preview</p>
      <pre class="text-xs bg-white/5 rounded p-3 text-slate-300 whitespace-pre-wrap max-h-40 overflow-auto">{{
        promptPreview || '—'
      }}</pre>
      <div class="flex gap-2">
        <button type="button" class="darwin-btn-ghost" @click="step = 3">Back</button>
        <button type="button" class="darwin-btn-primary" :disabled="loading" @click="deploy">Deploy</button>
      </div>
    </div>
  </div>
</template>
