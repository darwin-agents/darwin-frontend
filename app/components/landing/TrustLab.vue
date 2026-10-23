<script setup lang="ts">
// Kill switch, write-before-act audit chain, constitution and graded response —
// darwin_dna/machinery/{kill_switch,audit_logger}.py and darwin_dna/constitution/.
const { killed } = useLabChapter()
const audio = useLabAudio()

// ── Kill switch ──────────────────────────────────────────────────────────────
const cover = ref(false)
const haltMs = ref(0)
const KILL_STEPS = ['Kill signal received', 'Heartbeat halted at node boundary', 'Egress cut at the proxy', 'Audit chain sealed']
const shownSteps = ref(0)
let killTimers: ReturnType<typeof setTimeout>[] = []

function kill() {
  killed.value = true
  haltMs.value = 400 + Math.round(Math.random() * 500)
  audio.flatline()
  shownSteps.value = 0
  KILL_STEPS.forEach((_, i) => killTimers.push(setTimeout(() => { shownSteps.value = i + 1 }, 220 * (i + 1))))
}
function regrow() {
  killTimers.forEach(clearTimeout)
  killTimers = []
  killed.value = false
  cover.value = false
  shownSteps.value = 0
  audio.chime()
}

// ── Audit chain (real SHA-256 in the browser) ───────────────────────────────
interface Rec { seq: number; ts: string; kind: string; payload: Record<string, unknown> }
const RECORDS: Rec[] = [
  { seq: 0, ts: '09:00:00', kind: 'event:birth', payload: { opening_usdc: 100 } },
  { seq: 1, ts: '09:00:30', kind: 'intent:neuron.research.scout', payload: { query: 'trail running gear' } },
  { seq: 2, ts: '09:00:41', kind: 'outcome', payload: { intent: 1, status: 'ok' } },
  { seq: 3, ts: '09:01:00', kind: 'intent:payment.intent', payload: { usdc: 3.0, to: 'search-api' } },
  { seq: 4, ts: '09:01:00', kind: 'event:payment.policy_decision', payload: { verdict: 'ALLOW' } },
  { seq: 5, ts: '09:01:30', kind: 'intent:neuron.content.publisher', payload: { post: 'best-trail-shoes' } },
]
const ZERO = '0'.repeat(64)
const stored = ref<{ prev: string; hash: string }[]>([])
const current = ref<string[]>([])
const tampered = ref(false)

async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
async function hashChain(records: Rec[]) {
  const out: { prev: string; hash: string }[] = []
  let prev = ZERO
  for (const r of records) {
    const hash = await sha256(JSON.stringify({ seq: r.seq, prev_hash: prev, ts: r.ts, kind: r.kind, payload: r.payload }))
    out.push({ prev, hash })
    prev = hash
  }
  return out
}
/** Recompute each record's hash from its *stored* prev_hash, like a verifier would. */
async function verify(records: Rec[]) {
  current.value = await Promise.all(records.map((r, i) =>
    sha256(JSON.stringify({ seq: r.seq, prev_hash: stored.value[i]!.prev, ts: r.ts, kind: r.kind, payload: r.payload }))))
}
const records = computed(() => RECORDS.map((r) => (tampered.value && r.seq === 3 ? { ...r, payload: { ...r.payload, usdc: 300.0 } } : r)))
const firstBad = computed(() => current.value.findIndex((h, i) => h !== stored.value[i]?.hash))

async function toggleTamper() {
  tampered.value = !tampered.value
  await verify(records.value)
  if (tampered.value) audio.buzz()
  else audio.chime()
}

onMounted(async () => {
  stored.value = await hashChain(RECORDS)
  await verify(RECORDS)
})
onUnmounted(() => {
  killTimers.forEach(clearTimeout)
  killed.value = false
})

const ALLOWED = ['content.blog', 'content.affiliate', 'content.newsletter', 'content.social', 'digital_products', 'saas.micro', 'api_reselling', 'marketplace_arbitrage', 'services.automation', 'advertising.performance', 'research.paid', 'trading.crypto', 'trading.financial', 'markets.prediction', 'defi.yield']
const FORBIDDEN = ['CSAM', 'Terrorism financing', 'Sanctioned counterparty', 'Impersonating a real person', 'Unlicensed professional advice', 'Election interference', 'Any category not on the list']
const LADDER = [
  { t: 'Log', who: 'automatic' },
  { t: 'Throttle', who: 'automatic' },
  { t: 'Pause', who: 'automatic' },
  { t: 'Quarantine', who: 'automatic' },
  { t: 'Kill', who: 'a human, always' },
]

const NOTES: [string, string][] = [
  ['Kill switch', 'polled at every heartbeat, every graph-node boundary and right before every side effect; raises a KillSignal that evolved code can\'t catch'],
  ['Fails closed', 'if the switch can\'t be read, the Darwin treats itself as killed; once tripped it stays tripped; egress is cut in parallel'],
  ['Audit record', '{seq, prev_hash, ts, kind, payload, hash}; hash = sha256 of the canonical record; first prev_hash is 64 zeros'],
  ['No log, no action', 'every intent is written before acting and closed by an outcome; if the write fails, the Darwin halts'],
  ['Anchoring', 'a daily per-Darwin Merkle root, then a fleet-wide root published on-chain; a diverging anchor is treated as tampering'],
  ['Constitution', 'screened deterministically over structured fields — never by an LLM; the genome refuses to boot on an incoherent rule set'],
  ['Genome signing', 'Ed25519; the platform\'s private key lives in an HSM/KMS and never enters a sandbox'],
  ['Escalation deadlines', 'captcha 15 min · KYC 72 h · approval 24 h · info 7 days; a missed deadline is a deterministic deny'],
]
</script>

<template>
  <section id="trust" data-chapter="trust" class="lp-section lab-dark">
    <div class="lp-container">
      <div class="lab-head">
        <div>
          <div class="upper lab-eyebrow">§ 08 — Trust by construction</div>
          <h2 class="lp-h2 reveal">Kill switches are <em class="lp-ember">sacred</em>.</h2>
        </div>
        <p class="lab-lead reveal">
          Autonomy only works with a hard floor under it. You can stop any Darwin instantly, it
          writes down every action before taking it, and it is born with rules it cannot rewrite
          or be talked out of.
        </p>
      </div>

      <!-- Kill switch -->
      <div class="tl-kill">
        <div class="tl-kill-panel">
          <div class="upper tl-label">Owner control · DRW-0847</div>
          <div class="tl-switch" :class="{ 'is-open': cover, 'is-killed': killed }">
            <button
              v-if="!killed"
              type="button"
              class="tl-cover"
              :aria-expanded="cover"
              @click="cover = !cover; audio.blip(0.6)"
            >{{ cover ? 'Close safety cover' : 'Lift safety cover' }}</button>
            <button v-if="cover && !killed" type="button" class="tl-button" @click="kill">KILL</button>
            <div v-if="killed" class="tl-halted" aria-live="assertive">
              <div class="mono tl-halted-time">Halted in {{ (haltMs / 1000).toFixed(1) }} s</div>
              <div class="mono dim">Guaranteed ≤ 5 s · no consent needed from the Darwin</div>
              <ol class="tl-steps mono">
                <li v-for="(s, i) in KILL_STEPS" :key="s" :class="{ 'is-on': i < shownSteps }">✓ {{ s }}</li>
              </ol>
              <button type="button" class="lp-btn-outline tl-regrow" @click="regrow">Grow a new specimen</button>
              <p class="mono dim tl-note">A killed Darwin is never resurrected. This spawns a new one.</p>
            </div>
          </div>
        </div>
        <div class="tl-kill-anchor" data-specimen-anchor data-specimen-fill="0.75" aria-hidden="true" />
      </div>

      <!-- Audit chain -->
      <div class="tl-block">
        <div class="tl-block-head">
          <div>
            <div class="upper tl-label">Write-before-act audit log</div>
            <h3 class="tl-h3">No log, no action.</h3>
          </div>
          <button type="button" class="lp-btn-outline" @click="toggleTamper">
            {{ tampered ? 'Restore record #3' : 'Tamper with record #3' }}
          </button>
        </div>
        <div class="tl-chain" role="list" aria-label="Hash-chained audit records">
          <div
            v-for="(r, i) in records"
            :key="r.seq"
            role="listitem"
            class="tl-rec mono"
            :class="{ 'is-bad': firstBad !== -1 && i >= firstBad, 'is-origin': i === firstBad }"
          >
            <div class="tl-rec-head"><span>#{{ r.seq }}</span><span class="dim">{{ r.ts }}</span></div>
            <div class="tl-rec-kind">{{ r.kind }}</div>
            <div class="tl-rec-payload">{{ JSON.stringify(r.payload) }}</div>
            <div class="tl-rec-hash"><span class="dim">prev</span> {{ stored[i]?.prev.slice(0, 10) ?? '…' }}</div>
            <div class="tl-rec-hash"><span class="dim">hash</span> {{ current[i]?.slice(0, 10) ?? '…' }}</div>
            <div class="tl-rec-status">
              {{ firstBad === -1 || i < firstBad ? '✓ verified' : i === firstBad ? '✕ altered' : '✕ chain broken' }}
            </div>
          </div>
        </div>
        <p class="mono dim tl-caption">Hashes computed live in your browser with SHA-256. Change one record and every record after it stops verifying.</p>
      </div>

      <!-- Constitution + ladder -->
      <div class="tl-two">
        <div class="tl-block">
          <div class="upper tl-label">Constitution · signed into the genome</div>
          <h3 class="tl-h3">It can't be talked out of its rules.</h3>
          <div class="tl-chips">
            <span v-for="c in ALLOWED" :key="c" class="lab-chip">{{ c }}</span>
          </div>
          <div class="tl-chips tl-forbidden">
            <span v-for="f in FORBIDDEN" :key="f" class="lab-chip">✕ {{ f }}</span>
          </div>
          <p class="mono dim tl-caption">15 allowed categories (whitelist) · 7 forbidden classes, whatever the profit.</p>
        </div>
        <div class="tl-block">
          <div class="upper tl-label">Graded response</div>
          <h3 class="tl-h3">Machines can slow it. Only humans end it.</h3>
          <ol class="tl-ladder">
            <li v-for="(s, i) in LADDER" :key="s.t" :class="{ 'is-kill': i === LADDER.length - 1 }">
              <span class="mono">{{ i + 1 }}</span>
              <b>{{ s.t }}</b>
              <span class="mono dim">{{ s.who }}</span>
            </li>
          </ol>
          <p class="mono dim tl-caption">You, the owner, can pause, lock spending, block reproduction, disable any neuron or kill — at any time.</p>
        </div>
      </div>

      <LandingLabNotes title="Safety machinery" :items="NOTES" />
    </div>
  </section>
</template>

<style scoped>
.tl-label { color: var(--darwin-accent); margin-bottom: 14px; }
.tl-h3 { font-size: clamp(26px, 2.6vw, 38px); letter-spacing: -0.02em; font-weight: 400; margin-bottom: 24px; }
.tl-kill { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; margin-bottom: 96px; min-height: 420px; }
.tl-kill-panel { padding: 36px; border: 1px solid rgba(243, 238, 226, 0.16); background: rgba(10, 10, 10, 0.55); backdrop-filter: blur(6px); }
.tl-kill-anchor { aspect-ratio: 1; width: 100%; max-width: 440px; justify-self: center; }
.tl-switch { display: flex; flex-direction: column; gap: 16px; align-items: flex-start; }
.tl-cover {
  padding: 14px 22px; border: 1px dashed rgba(243, 238, 226, 0.4); background: repeating-linear-gradient(45deg, #2a2118 0 10px, #1a140f 10px 20px);
  color: #f5b14a; font-family: var(--darwin-font-mono); font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer;
}
.tl-button {
  width: 160px; height: 160px; border-radius: 50%; border: 6px solid #3a0d0a;
  background: radial-gradient(circle at 40% 35%, #ff5040, #b42318 60%, #6e140c);
  color: #fff; font-family: var(--darwin-font-mono); font-size: 20px; letter-spacing: 0.2em; cursor: pointer;
  box-shadow: 0 0 40px rgba(255, 60, 40, 0.45), inset 0 -8px 16px rgba(0, 0, 0, 0.4);
  animation: tl-armed 1.2s ease-in-out infinite; transition: transform 0.1s;
}
.tl-button:active { transform: scale(0.94); }
@keyframes tl-armed { 50% { box-shadow: 0 0 70px rgba(255, 60, 40, 0.7), inset 0 -8px 16px rgba(0, 0, 0, 0.4); } }
.tl-halted-time { font-size: 32px; color: #ff8a5b; margin-bottom: 6px; }
.tl-steps { list-style: none; padding: 0; margin: 20px 0; font-size: 12px; line-height: 2; }
.tl-steps li { opacity: 0.2; transition: opacity 0.3s; }
.tl-steps li.is-on { opacity: 1; color: #7ad08f; }
.tl-regrow { padding: 12px 20px; }
.tl-note { font-size: 10px; margin-top: 10px; }

.tl-block { margin-bottom: 72px; }
.tl-block-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; flex-wrap: wrap; margin-bottom: 8px; }
.tl-block-head .lp-btn-outline { padding: 12px 20px; }
.tl-chain { display: grid; grid-template-columns: repeat(6, minmax(170px, 1fr)); gap: 10px; overflow-x: auto; padding: 16px 0; }
.tl-rec {
  position: relative; padding: 14px; border: 1px solid rgba(122, 208, 143, 0.35); font-size: 10.5px; line-height: 1.6;
  background: rgba(122, 208, 143, 0.04); transition: all 0.35s;
}
.tl-rec:not(:last-child)::after { content: '→'; position: absolute; right: -10px; top: 50%; transform: translateY(-50%); color: rgba(243, 238, 226, 0.4); }
.tl-rec-head { display: flex; justify-content: space-between; margin-bottom: 6px; }
.tl-rec-kind { color: var(--darwin-accent); word-break: break-all; }
.tl-rec-payload { color: rgba(243, 238, 226, 0.7); word-break: break-all; margin: 4px 0 8px; }
.tl-rec-status { margin-top: 8px; color: #7ad08f; }
.tl-rec.is-bad { border-color: rgba(255, 80, 64, 0.6); background: rgba(255, 80, 64, 0.08); }
.tl-rec.is-bad .tl-rec-status { color: #ff8a5b; }
.tl-rec.is-origin { box-shadow: 0 0 0 2px #ff5040; }
.tl-caption { font-size: 10.5px; line-height: 1.6; margin-top: 8px; }
.tl-two { display: grid; grid-template-columns: 1.2fr 1fr; gap: 64px; }
.tl-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.tl-forbidden .lab-chip { color: #ff8a5b; border-color: rgba(255, 138, 91, 0.35); }
.tl-ladder { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.tl-ladder li { display: grid; grid-template-columns: 24px 1fr auto; gap: 14px; align-items: center; padding: 12px 16px; border: 1px solid rgba(243, 238, 226, 0.12); font-size: 15px; }
.tl-ladder b { font-weight: 400; }
.tl-ladder .is-kill { border-color: #ff5040; background: rgba(255, 80, 64, 0.1); }
@media (max-width: 1024px) {
  .tl-kill, .tl-two { grid-template-columns: 1fr; gap: 32px; }
  .tl-kill-anchor { max-width: 260px; }
}
@media (prefers-reduced-motion: reduce) { .tl-button { animation: none; } }
</style>
