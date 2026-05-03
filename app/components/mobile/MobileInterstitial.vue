<script setup lang="ts">
import { Lock, ScanFace, ShieldQuestion, Timer, Dna } from 'lucide-vue-next'

const { decoded, isExpired } = useInterventionJWT()

const purpose = computed(() => decoded.value?.purpose ?? 'general')
const code = ref('')
const countdown = ref(120)

if (import.meta.client) {
  const t = setInterval(() => {
    if (countdown.value > 0) countdown.value -= 1
  }, 1000)
  onUnmounted(() => clearInterval(t))
}

async function submitCode() {
  /* POST resolve endpoint when backend exists */
}

function resumeAgent() {
  /* resume */
}

async function approve() {
  /* approval relay */
}

async function deny() {
  /* deny */
}

const approvalDetails = computed(() => {
  const d = decoded.value as { amount?: number; justification?: string; token_roi_estimate?: string } | null
  return {
    amount: d?.amount ?? 0,
    justification: d?.justification ?? '',
    token_roi_estimate: d?.token_roi_estimate ?? null,
  }
})

const sessionId = computed(() => decoded.value?.session_id ?? '')
</script>

<template>
  <!-- Expired -->
  <div v-if="isExpired" class="min-h-screen bg-darwin-bg flex flex-col items-center justify-center p-6">
    <Dna :size="32" class="text-slate-700 mb-4" />
    <p class="text-sm text-slate-400">This link has expired.</p>
  </div>

  <template v-else-if="decoded">
    <!-- 2FA variant -->
    <div v-if="purpose === '2fa'" class="min-h-screen bg-darwin-bg flex flex-col items-center justify-center p-6">
      <div class="w-full max-w-sm space-y-5">
        <div class="text-center">
          <div class="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
            <Lock :size="24" class="text-violet-400" />
          </div>
          <h1 class="text-lg font-semibold text-white">2FA Code Required</h1>
          <p class="text-sm text-slate-500 mt-1">Enter the code from your authenticator</p>
        </div>
        <input
          v-model="code"
          type="tel"
          maxlength="8"
          placeholder="000000"
          class="darwin-input text-center text-3xl font-mono tracking-[0.3em] h-16"
          inputmode="numeric"
        />
        <div class="flex items-center gap-2 text-xs text-slate-500 justify-center">
          <Timer :size="12" />
          <span>Expires in {{ countdown }}s</span>
        </div>
        <button type="button" :disabled="code.length < 6" class="darwin-btn-primary w-full h-12 text-base" @click="submitCode">
          Submit Code
        </button>
      </div>
    </div>

    <!-- CAPTCHA variant -->
    <div v-else-if="purpose === 'captcha'" class="min-h-screen bg-darwin-bg flex flex-col">
      <div class="px-5 py-4 flex items-center gap-3 border-b border-white/[0.06]">
        <ScanFace :size="20" class="text-orange-400" />
        <h1 class="text-sm font-semibold text-white">Solve CAPTCHA</h1>
      </div>
      <iframe
        :src="`/sessions/${sessionId}/stream`"
        class="flex-1 border-0 min-h-[50vh]"
        title="Captcha session"
      />
      <div class="px-5 py-4 border-t border-white/[0.06]">
        <button type="button" class="darwin-btn-primary w-full" @click="resumeAgent">
          CAPTCHA Solved — Resume Agent
        </button>
      </div>
    </div>

    <!-- Approval variant -->
    <div v-else class="min-h-screen bg-darwin-bg flex flex-col items-center justify-center p-6">
      <div class="w-full max-w-sm space-y-5">
        <div class="text-center">
          <div class="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <ShieldQuestion :size="24" class="text-amber-400" />
          </div>
          <h1 class="text-lg font-semibold text-white">Approval Required</h1>
        </div>
        <div class="darwin-card p-5 space-y-3">
          <div>
            <p class="text-[10px] text-slate-500 uppercase tracking-wider">Amount</p>
            <p class="text-2xl font-semibold text-white font-mono mt-1">${{ approvalDetails.amount.toFixed(2) }}</p>
          </div>
          <div v-if="approvalDetails.justification">
            <p class="text-[10px] text-slate-500 uppercase tracking-wider">Justification</p>
            <p class="text-sm text-slate-200 mt-1 leading-relaxed">{{ approvalDetails.justification }}</p>
          </div>
          <p v-if="approvalDetails.token_roi_estimate" class="text-xs text-violet-400 mt-2">
            {{ approvalDetails.token_roi_estimate }}
          </p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <button type="button" class="darwin-btn-ghost h-14 text-red-400 border border-red-500/20" @click="deny">
            Deny
          </button>
          <button type="button" class="darwin-btn-primary h-14 bg-green-600 hover:bg-green-500" @click="approve">
            Approve
          </button>
        </div>
      </div>
    </div>
  </template>

  <!-- No token -->
  <div v-else class="min-h-screen bg-darwin-bg flex flex-col items-center justify-center p-6">
    <Dna :size="32" class="text-slate-700 mb-4" />
    <p class="text-sm text-slate-500">Missing or invalid token.</p>
  </div>
</template>
