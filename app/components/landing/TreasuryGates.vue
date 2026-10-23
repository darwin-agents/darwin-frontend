<script setup lang="ts">
import type { GateName, GateStep, PaymentRequest, Verdict } from '~/utils/labSim'

// Interactive version of darwin_dna/machinery/treasury_policy.py (pure, first rule wins).
const audio = useLabAudio()

const base = { balance: 142.18, category: 'content.affiliate', envelope: ['content.affiliate', 'content.blog'], spentToday: 38, history: 24, recentMax: 4.2 }
const SAMPLES: { label: string; detail: string; req: PaymentRequest }[] = [
  { label: '$3.00', detail: 'Search API call', req: { ...base, amount: 3 } },
  { label: '$12.00', detail: 'Freelance copy edit', req: { ...base, amount: 12, paysHuman: true } },
  { label: '$80.00', detail: 'Ad campaign', req: { ...base, amount: 80 } },
  { label: '$9.00', detail: 'Supplier in a sanctioned country', req: { ...base, amount: 9, sanctioned: true } },
  { label: '$30.00', detail: 'Hosting, with $20 left', req: { ...base, amount: 30, balance: 20 } },
  { label: '$4.00', detail: 'Crypto trade, off-strategy', req: { ...base, amount: 4, category: 'trading.crypto' } },
  { label: '$4.50', detail: 'API burst, 25× usual', req: { ...base, amount: 4.5, recentMax: 0.18 } },
]

const GATE_INFO: Record<GateName, string> = {
  forbidden: 'Sanctioned places and people',
  caps: '$50 / action · $500 / day · $10k / life',
  solvency: 'Never below the $1 survival floor',
  envelope: 'Inside the current strategy',
  escalation: 'Humans paid or > $5: ask the owner',
  anomaly: '> 20× the recent maximum',
}

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
  return last && last.result !== 'PASS' ? last.reason : 'All six gates clear. Payment goes out and is logged before it moves.'
})

onUnmounted(() => timers.forEach(clearTimeout))

const NOTES: [string, string][] = [
  ['Engine', 'pure and deterministic: no I/O, no clock, no LLM. If the engine itself faults, the Darwin halts'],
  ['Caps', 'checks max(amount, p95 estimate) against min(hard cap, owner cap); owners can tighten, never loosen'],
  ['Pre-approvals', 'typed owner rules (counterparty, max amount, expiry, uses) skip the escalation step only; caps still apply'],
  ['Money rails', 'USDC on Base (testnet today), Solana and Stellar fallbacks; x402 pay-per-request goes through the same gate'],
  ['Wallet', 'keys in a hardware enclave or sealed in the Darwin\'s own vault; only payments.facilitator can sign'],
  ['Sanctions', 'screened before every transfer; fails closed'],
  ['Ledger', 'double-entry, hash-chained, reconciled against the chain every heartbeat; a mismatch over $0.01 halts the Darwin'],
  ['Harvest', 'owners withdraw profit on their own rules; the platform takes 20% of harvested profit only — nothing on what stays or on death'],
]
</script>

<template>
  <section id="treasury" data-chapter="treasury" class="lp-section lp-bg-2">
    <div class="lp-container">
      <div class="lab-head">
        <div>
          <div class="upper dim lab-eyebrow">§ 06 — Treasury</div>
          <h2 class="lp-h2 reveal">Every cent passes <em class="lp-ember-deep">six gates</em>.</h2>
        </div>
        <p class="lab-lead reveal">
          A Darwin holds real money, so its wallet is wrapped in rules it cannot argue with.
          Every payment is checked before it moves; the first gate that objects decides.
          It can never spend more than you fund. Try a payment.
        </p>
      </div>

      <div class="tg-grid">
        <div class="tg-samples">
          <button
            v-for="(s, i) in SAMPLES"
            :key="s.detail"
            type="button"
            class="tg-sample"
            :class="{ 'is-active': picked === i }"
            :aria-pressed="picked === i"
            @click="run(i)"
          >
            <span class="mono tg-amount">{{ s.label }}</span>
            <span>{{ s.detail }}</span>
          </button>
        </div>

        <div class="tg-pipe">
          <ol class="tg-gates">
            <li v-for="(g, k) in GATES" :key="g" class="tg-gate" :class="`is-${gateState(g)}`">
              <span class="mono tg-gate-num">{{ k + 1 }}</span>
              <div>
                <div class="tg-gate-name">{{ g }}</div>
                <div class="tg-gate-info mono">{{ GATE_INFO[g] }}</div>
              </div>
              <span class="mono tg-gate-state">{{ gateState(g) === 'idle' ? '' : gateState(g) }}</span>
            </li>
          </ol>
          <div class="tg-result" :class="done ? `is-${result!.verdict.toLowerCase()}` : ''" aria-live="polite">
            <template v-if="done">
              <div class="mono tg-verdict">{{ result!.verdict }}</div>
              <p>{{ finalReason }}</p>
            </template>
            <p v-else class="dim">{{ picked === null ? 'Pick a payment on the left.' : 'Checking…' }}</p>
          </div>
        </div>
      </div>

      <LandingLabNotes title="Treasury & money rails" :items="NOTES" />
    </div>
  </section>
</template>

<style scoped>
.tg-grid { display: grid; grid-template-columns: 1fr 1.3fr; gap: 48px; align-items: start; }
.tg-samples { display: flex; flex-direction: column; gap: 8px; }
.tg-sample {
  display: grid; grid-template-columns: 90px 1fr; gap: 16px; align-items: center; text-align: left;
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
