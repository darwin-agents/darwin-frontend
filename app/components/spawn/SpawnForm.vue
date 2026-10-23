<script setup lang="ts">
import {
  User, DollarSign, Wrench, Rocket, ChevronRight, ChevronLeft,
  Loader2, Check, Info,
} from 'lucide-vue-next'

const { t, locale } = useI18n()
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
  { id: 'claude-sonnet-4-6',  label: 'Claude Sonnet 4.6',  note: 'sonnet',    color: 'border-model-sonnet/40 bg-model-sonnet/10' },
  { id: 'claude-haiku-4-5',   label: 'Claude Haiku 4.5',   note: 'haiku',     color: 'border-model-haiku/40 bg-model-haiku/10' },
  { id: 'claude-opus-4-6',    label: 'Claude Opus 4.6',    note: 'opus',      color: 'border-model-opus/40 bg-model-opus/10' },
  { id: 'gpt-4o',             label: 'GPT-4o',             note: 'gpt4o',     color: 'border-model-gpt4o/40 bg-model-gpt4o/10' },
  { id: 'gpt-4o-mini',        label: 'GPT-4o Mini',        note: 'gpt4oMini', color: 'border-model-gpt4omini/40 bg-model-gpt4omini/10' },
]

const toolDefs = [
  { key: 'browser' as const },
  { key: 'finance' as const },
  { key: 'code' as const },
]

const steps = [
  { num: 1, id: 'identity', icon: User },
  { num: 2, id: 'budget',   icon: DollarSign },
  { num: 3, id: 'tools',    icon: Wrench },
  { num: 4, id: 'review',   icon: Rocket },
]

function usd(v: number) {
  return v.toLocaleString(locale.value, { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

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
    errorMsg.value = t('spawn.form.errors.nameLength')
    return
  }
  if (directive.length < 10) {
    errorMsg.value = t('spawn.form.errors.directiveLength')
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
    else errorMsg.value = t('spawn.form.errors.noAgentId')
  } catch (e: any) {
    const detail = e?.data?.detail
    if (Array.isArray(detail) && detail.length) {
      const first = detail[0]
      const field = Array.isArray(first?.loc) ? String(first.loc[first.loc.length - 1]) : t('spawn.form.errors.unknownField')
      const msg = typeof first?.msg === 'string' ? first.msg : t('spawn.form.errors.invalidValue')
      errorMsg.value = t('spawn.form.errors.validation', { field, message: msg })
    } else {
      errorMsg.value = e instanceof Error ? e.message : t('spawn.form.errors.failed')
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
            ? 'bg-darwin-accent/10 text-darwin-accent-deep border border-darwin-accent/20'
            : step > s.num
              ? 'text-darwin-ink-soft'
              : 'text-darwin-muted'"
          @click="s.num < step ? step = s.num : null"
        >
          <div
            class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0"
            :class="step > s.num
              ? 'bg-darwin-accent text-darwin-bg'
              : step === s.num
                ? 'bg-darwin-accent/20 text-darwin-accent-deep border border-darwin-accent/40'
                : 'bg-darwin-bg-2 text-darwin-muted border border-darwin-border'"
          >
            <Check v-if="step > s.num" :size="10" />
            <span v-else>{{ s.num }}</span>
          </div>
          <span class="hidden sm:inline">{{ t(`spawn.form.steps.${s.id}`) }}</span>
        </button>
        <ChevronRight v-if="i < steps.length - 1" :size="12" class="text-darwin-muted shrink-0" />
      </template>
    </nav>

    <!-- Step 1: Identity -->
    <div v-if="step === 1" class="space-y-5 animate-fade-in">
      <div>
        <h2 class="text-lg font-semibold text-darwin-ink mb-1">{{ t('spawn.form.identity.title') }}</h2>
        <p class="text-sm text-darwin-muted">{{ t('spawn.form.identity.subtitle') }}</p>
      </div>

      <div>
        <label class="text-xs text-darwin-muted mb-1.5 block">{{ t('spawn.form.identity.nameLabel') }}</label>
        <input v-model="form.name" :placeholder="t('spawn.form.identity.namePlaceholder')" class="darwin-input" />
      </div>

      <div>
        <label class="text-xs text-darwin-muted mb-1.5 block">{{ t('spawn.form.identity.directiveLabel') }}</label>
        <textarea
          v-model="form.directive"
          :placeholder="t('spawn.form.identity.directivePlaceholder')"
          class="darwin-input min-h-[160px] resize-y"
        />
        <p class="text-[11px] text-darwin-muted mt-1.5">
          {{ t('spawn.form.identity.directiveHint') }}
        </p>
      </div>

      <div>
        <label class="text-xs text-darwin-muted mb-2 block">{{ t('spawn.form.identity.modelLabel') }}</label>
        <div class="space-y-2">
          <label
            v-for="m in models"
            :key="m.id"
            class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all"
            :class="form.model === m.id
              ? m.color + ' border'
              : 'border-darwin-border bg-darwin-bg-2 hover:bg-darwin-bg-3'"
          >
            <input v-model="form.model" type="radio" :value="m.id" class="accent-darwin-accent" />
            <div class="flex-1">
              <span class="text-sm text-darwin-ink">{{ m.label }}</span>
              <span class="text-xs text-darwin-muted ms-2">{{ t(`spawn.form.modelNotes.${m.note}`) }}</span>
            </div>
          </label>
        </div>
        <div class="flex items-start gap-2 mt-3 text-[11px] text-darwin-muted">
          <Info :size="12" class="shrink-0 mt-0.5" />
          <span>{{ t('spawn.form.identity.modelHint') }}</span>
        </div>
      </div>
    </div>

    <!-- Step 2: Budget -->
    <div v-if="step === 2" class="space-y-5 animate-fade-in">
      <div>
        <h2 class="text-lg font-semibold text-darwin-ink mb-1">{{ t('spawn.form.budget.title') }}</h2>
        <p class="text-sm text-darwin-muted">{{ t('spawn.form.budget.subtitle') }}</p>
      </div>

      <div class="darwin-card p-6">
        <div class="flex items-baseline justify-between mb-4">
          <label class="text-xs text-darwin-muted">{{ t('spawn.form.budget.initialLabel') }}</label>
          <span class="text-2xl font-semibold text-darwin-ink font-mono">{{ usd(form.budget) }}</span>
        </div>
        <input
          v-model.number="form.budget"
          type="range"
          min="5"
          max="500"
          step="5"
          class="w-full accent-darwin-accent cursor-pointer"
        />
        <div class="flex justify-between text-[10px] text-darwin-muted mt-1">
          <span>{{ usd(5) }}</span>
          <span>{{ usd(500) }}</span>
        </div>
      </div>

      <div class="flex items-start gap-2 text-[11px] text-darwin-muted bg-darwin-bg-2 rounded-lg p-3 border border-darwin-border">
        <Info :size="12" class="shrink-0 mt-0.5" />
        <span>{{ t('spawn.form.budget.capNote') }}</span>
      </div>
    </div>

    <!-- Step 3: Tools -->
    <div v-if="step === 3" class="space-y-5 animate-fade-in">
      <div>
        <h2 class="text-lg font-semibold text-darwin-ink mb-1">{{ t('spawn.form.tools.title') }}</h2>
        <p class="text-sm text-darwin-muted">{{ t('spawn.form.tools.subtitle') }}</p>
      </div>

      <div class="space-y-2">
        <label
          v-for="tool in toolDefs"
          :key="tool.key"
          class="flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all"
          :class="form.tools[tool.key]
            ? 'border-darwin-accent/20 bg-darwin-accent/[0.04]'
            : 'border-darwin-border bg-darwin-bg-2 hover:bg-darwin-bg-3'"
        >
          <div>
            <p class="text-sm font-medium text-darwin-ink">{{ t(`spawn.form.toolOptions.${tool.key}.label`) }}</p>
            <p class="text-xs text-darwin-muted mt-0.5">{{ t(`spawn.form.toolOptions.${tool.key}.desc`) }}</p>
          </div>
          <div
            class="w-9 h-5 rounded-full relative transition-colors cursor-pointer shrink-0 ms-4"
            :class="form.tools[tool.key] ? 'bg-darwin-accent' : 'bg-darwin-bg-3'"
            @click.prevent="form.tools[tool.key] = !form.tools[tool.key]"
          >
            <span
              class="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform"
              :class="form.tools[tool.key] ? 'translate-x-[18px]' : 'translate-x-0.5'"
            />
          </div>
          <input v-model="form.tools[tool.key]" type="checkbox" class="sr-only" />
        </label>
      </div>
    </div>

    <!-- Step 4: Review -->
    <div v-if="step === 4" class="space-y-5 animate-fade-in">
      <div>
        <h2 class="text-lg font-semibold text-darwin-ink mb-1">{{ t('spawn.form.review.title') }}</h2>
        <p class="text-sm text-darwin-muted">{{ t('spawn.form.review.subtitle') }}</p>
      </div>

      <div class="darwin-card divide-y divide-darwin-border">
        <div class="p-4 flex items-center justify-between">
          <span class="text-xs text-darwin-muted">{{ t('spawn.form.review.name') }}</span>
          <span class="text-sm text-darwin-ink font-medium">{{ form.name }}</span>
        </div>
        <div class="p-4 flex items-center justify-between">
          <span class="text-xs text-darwin-muted">{{ t('spawn.form.review.model') }}</span>
          <span class="text-sm text-darwin-ink">{{ selectedModel?.label }}</span>
        </div>
        <div class="p-4 flex items-center justify-between">
          <span class="text-xs text-darwin-muted">{{ t('spawn.form.review.budget') }}</span>
          <span class="text-sm text-darwin-ink font-mono">{{ usd(form.budget) }}</span>
        </div>
        <div class="p-4 flex items-center justify-between">
          <span class="text-xs text-darwin-muted">{{ t('spawn.form.review.tools') }}</span>
          <div class="flex gap-1.5">
            <span
              v-for="tool in enabledTools"
              :key="tool"
              class="darwin-badge text-darwin-accent-deep bg-darwin-accent/10 border-darwin-accent/20"
            >{{ t(`spawn.form.toolOptions.${tool}.label`) }}</span>
          </div>
        </div>
        <div class="p-4">
          <span class="text-xs text-darwin-muted block mb-2">{{ t('spawn.form.review.directivePreview') }}</span>
          <pre class="text-xs text-darwin-ink-soft whitespace-pre-wrap leading-relaxed max-h-32 overflow-auto font-mono">{{ promptPreview || '—' }}</pre>
        </div>
      </div>

      <div v-if="errorMsg" class="rounded-lg px-3 py-2.5 text-xs bg-red-50 text-red-800 border-red-600/20 border">
        {{ errorMsg }}
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex items-center justify-between mt-8 pt-6 border-t border-darwin-border">
      <button
        v-if="step > 1"
        type="button"
        class="darwin-btn-ghost"
        @click="step--"
      >
        <ChevronLeft :size="16" />
        {{ t('spawn.form.back') }}
      </button>
      <NuxtLink v-else to="/dashboard" class="darwin-btn-ghost text-xs">{{ t('spawn.form.cancel') }}</NuxtLink>

      <button
        v-if="step < 4"
        type="button"
        class="darwin-btn-primary"
        :disabled="!canProceed"
        @click="step++"
      >
        {{ t('spawn.form.continue') }}
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
        {{ loading ? t('spawn.form.deploying') : t('spawn.form.deploy') }}
      </button>
    </div>
  </div>
</template>
