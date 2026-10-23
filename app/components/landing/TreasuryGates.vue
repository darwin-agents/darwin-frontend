<script setup lang="ts">
import type { GateName, GateStep, PaymentRequest, Verdict } from '~/utils/labSim'

// Interactive version of darwin_dna/machinery/treasury_policy.py (pure, first rule wins).
const { t } = useI18n()
const audio = useLabAudio()

const base = { balance: 142.18, category: 'content.affiliate', envelope: ['content.affiliate', 'content.blog'], spentToday: 38, history: 24, recentMax: 4.2 }
const SAMPLES: { id: string; label: string; req: PaymentRequest }[] = [
  { id: 'searchApi', label: '$3.00', req: { ...base, amount: 3 } },
  { id: 'copyEdit', label: '$12.00', req: { ...base, amount: 12, paysHuman: true } },
  { id: 'adCampaign', label: '$80.00', req: { ...base, amount: 80 } },
  { id: 'sanctionedSupplier', label: '$9.00', req: { ...base, amount: 9, sanctioned: true } },
  { id: 'hosting', label: '$30.00', req: { ...base, amount: 30, balance: 20 } },
  { id: 'cryptoTrade', label: '$4.00', req: { ...base, amount: 4, category: 'trading.crypto' } },
  { id: 'apiBurst', label: '$4.50', req: { ...base, amount: 4.5, recentMax: 0.18 } },
]

const picked = ref<number | null>(null)
const revealed = ref(0) // how many trail steps are shown
const result = ref<{ verdict: Verdict; trail: GateStep[] } | null>(null)
let timers: ReturnType<typeof setTimeout>[] = []

function run(i: number) {
  timers.forEach(clearTimeout)
  timers = []
  picked.value = i
  result.value = evaluatePayment(SAMPLES[i]!.req)
  revealed.value = 0
  const trail = result.value.trail
  trail.forEach((step, k) => {
    timers.push(setTimeout(() => {
      revealed.value = k + 1
      if (step.result === 'PASS') audio.blip(1 + k * 0.12)
      else if (step.result === 'REFUSE') audio.buzz()
      else audio.ping()
      if (k === trail.length - 1 && step.result === 'PASS') audio.chime()
    }, 260 * (k + 1)))
  })
}

function gateState(gate: GateName) {
  const trail = result.value?.trail ?? []
  const idx = trail.findIndex((s) => s.gate === gate)
  if (idx === -1) return result.value && revealed.value >= trail.length ? 'skipped' : 'idle'
  if (idx >= revealed.value) return 'idle'
  return trail[idx]!.result.toLowerCase()
}
const done = computed(() => result.value && revealed.value >= result.value.trail.length)
const finalReason = computed(() => {
  const last = result.value?.trail.at(-1)
  return last && last.result !== 'PASS'
    ? t(`lab.treasury.reasons.${last.reason}`, last.params ?? {})
    : t('lab.treasury.allClear')
})

onUnmounted(() => timers.forEach(clearTimeout))

const NOTE_IDS = ['engine', 'caps', 'preApprovals', 'moneyRails', 'wallet', 'sanctions', 'ledger', 'harvest']
const notes = computed(() => NOTE_IDS.map((id): [string, string] => [t(`lab.treasury.notes.${id}.term`), t(`lab.treasury.notes.${id}.value`)]))
</script>

<template>
  <section id="treasury" data-chapter="treasury" class="lp-section lp-bg-2">
    <div class="lp-container">
      <div class="lab-head">
        <div>
          <div class="upper dim lab-eyebrow">{{ t('lab.treasury.eyebrow') }}</div>
          <i18n-t keypath="lab.treasury.title" tag="h2" class="lp-h2 reveal" scope="global">
            <template #em><em class="lp-ember-deep">{{ t('lab.treasury.titleEm') }}</em></template>
          </i18n-t>
        </div>
        <p class="lab-lead reveal">{{ t('lab.treasury.lead') }}</p>
      </div>

      <div class="tg-grid">
        <div class="tg-samples">
          <button
            v-for="(s, i) in SAMPLES"
            :key="s.id"
            type="button"
            class="tg-sample"
            :class="{ 'is-active': picked === i }"
            :aria-pressed="picked === i"
            @click="run(i)"
          >
            <span class="mono tg-amount">{{ s.label }}</span>
            <span>{{ t(`lab.treasury.samples.${s.id}`) }}</span>
          </button>
        </div>

        <div class="tg-pipe">
          <ol class="tg-gates">
            <li v-for="(g, k) in GATES" :key="g" class="tg-gate" :class="`is-${gateState(g)}`">
              <span class="mono tg-gate-num">{{ k + 1 }}</span>
              <div>
                <div class="tg-gate-name">{{ t(`lab.treasury.gates.${g}.name`) }}</div>
                <div class="tg-gate-info mono">{{ t(`lab.treasury.gates.${g}.info`) }}</div>
              </div>
              <span class="mono tg-gate-state">{{ gateState(g) === 'idle' ? '' : t(`lab.treasury.states.${gateState(g)}`) }}</span>
            </li>
          </ol>
          <div class="tg-result" :class="done ? `is-${result!.verdict.toLowerCase()}` : ''" aria-live="polite">
            <template v-if="done">
              <div class="mono tg-verdict">{{ t(`lab.treasury.verdicts.${result!.verdict.toLowerCase()}`) }}</div>
              <p>{{ finalReason }}</p>
            </template>
            <p v-else class="dim">{{ picked === null ? t('lab.treasury.pickPayment') : t('lab.treasury.checking') }}</p>
          </div>
        </div>
      </div>

      <LandingLabNotes :title="t('lab.treasury.notesTitle')" :items="notes" />
    </div>
  </section>
</template>

<style scoped>
.tg-grid { display: grid; grid-template-columns: 1fr 1.3fr; gap: 48px; align-items: start; }
.tg-samples { display: flex; flex-direction: column; gap: 8px; }
.tg-sample {
  display: grid; grid-template-columns: 90px 1fr; gap: 16px; align-items: center; text-align: start;
  padding: 16px 20px; border: 1px solid var(--darwin-border); background: var(--darwin-bg);
  font-size: 15px; cursor: pointer; transition: all 0.2s; color: var(--darwin-ink);
}
.tg-sample:hover { border-color: var(--darwin-ink); transform: translateX(4px); }
.tg-sample.is-active { background: var(--darwin-ink); color: var(--darwin-bg); border-color: var(--darwin-ink); }
.tg-amount { font-size: 14px; }
.tg-gates { list-style: none; padding: 0; margin: 0 0 16px; display: flex; flex-direction: column; gap: 6px; }
.tg-gate {
  display: grid; grid-template-columns: 32px 1fr auto; gap: 16px; align-items: center;
  padding: 14px 18px; border: 1px solid var(--darwin-border); background: var(--darwin-bg); transition: all 0.25s;
}
.tg-gate-num { font-size: 11px; color: var(--darwin-muted); }
.tg-gate-name { font-size: 16px; text-transform: capitalize; }
.tg-gate-info { font-size: 10px; color: var(--darwin-muted); margin-top: 2px; }
.tg-gate-state { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; }
.tg-gate.is-pass { border-color: #1f8a3e55; }
.tg-gate.is-pass .tg-gate-state { color: #1f8a3e; }
.tg-gate.is-refuse { background: #b42318; color: #fff; border-color: #b42318; }
.tg-gate.is-refuse :is(.tg-gate-info, .tg-gate-num) { color: #ffd9d4; }
.tg-gate.is-escalate { background: #f5b14a; border-color: #d48806; }
.tg-gate.is-skipped { opacity: 0.35; }
.tg-result { padding: 20px 22px; border: 1px dashed var(--darwin-border); min-height: 88px; transition: all 0.3s; }
.tg-result.is-allow { border: 1px solid #1f8a3e; background: #1f8a3e14; }
.tg-result.is-refuse { border: 1px solid #b42318; background: #b4231810; }
.tg-result.is-escalate { border: 1px solid #d48806; background: #f5b14a22; }
.tg-verdict { font-size: 22px; letter-spacing: 0.1em; margin-bottom: 6px; }
@media (max-width: 1024px) { .tg-grid { grid-template-columns: 1fr; } }
</style>
