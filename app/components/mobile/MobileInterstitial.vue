<script setup lang="ts">
import { Lock, ScanFace, ShieldQuestion, Timer } from 'lucide-vue-next'

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
  <div v-if="isExpired" class="min-h-screen bg-darwin-bg flex items-center justify-center p-6 text-slate-400 text-sm">
    This link has expired.
  </div>
  <template v-else-if="decoded">
    <div v-if="purpose === '2fa'" class="min-h-screen bg-darwin-bg flex flex-col items-center justify-center p-6">
      <div class="w-full max-w-sm space-y-4">
        <div class="text-center">
          <Lock :size="32" class="text-violet-400 mx-auto mb-3" />
          <h1 class="text-lg font-semibold text-white">2FA Code Required</h1>
        </div>
        <input
          v-model="code"
          type="tel"
          maxlength="8"
          placeholder="000000"
          class="w-full text-center text-3xl font-mono tracking-widest darwin-input h-16"
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
    <div v-else-if="purpose === 'captcha'" class="min-h-screen bg-darwin-bg flex flex-col">
      <div class="p-4 flex items-center gap-3 border-b border-white/10">
        <ScanFace :size="20" class="text-orange-400" />
        <h1 class="text-sm font-semibold text-white">Solve CAPTCHA</h1>
      </div>
      <iframe
        :src="`/sessions/${sessionId}/stream`"
        class="flex-1 border-0 min-h-[50vh]"
        title="Captcha session"
      />
      <div class="p-4 border-t border-white/10">
        <button type="button" class="darwin-btn-primary w-full" @click="resumeAgent">✓ CAPTCHA Solved — Resume Agent</button>
      </div>
    </div>
    <div v-else class="min-h-screen bg-darwin-bg flex flex-col items-center justify-center p-6">
      <div class="w-full max-w-sm space-y-4">
        <ShieldQuestion :size="32" class="text-amber-400 mx-auto block" />
        <h1 class="text-lg font-semibold text-white text-center">Approval Required</h1>
        <div class="bg-white/5 rounded p-4 space-y-2 text-sm">
          <p class="text-slate-400">Amount</p>
          <p class="text-2xl font-semibold text-white">${{ approvalDetails.amount.toFixed(2) }}</p>
          <p v-if="approvalDetails.justification" class="text-slate-400 mt-2">Justification</p>
          <p v-if="approvalDetails.justification" class="text-slate-200">{{ approvalDetails.justification }}</p>
          <p v-if="approvalDetails.token_roi_estimate" class="text-xs text-violet-400 mt-2">
            {{ approvalDetails.token_roi_estimate }}
          </p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <button type="button" class="darwin-btn-ghost h-14 text-red-400 border border-red-900" @click="deny">✕ Deny</button>
          <button type="button" class="darwin-btn-primary h-14 bg-green-700 hover:bg-green-600" @click="approve">✓ Approve</button>
        </div>
      </div>
    </div>
  </template>
  <div v-else class="min-h-screen bg-darwin-bg flex items-center justify-center text-slate-500 text-sm">Missing token.</div>
</template>
