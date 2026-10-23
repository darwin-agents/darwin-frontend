<script setup lang="ts">
// The 13 built-in neurons registered in darwin_dna/neurons/_registry.py.
const audio = useLabAudio()

const NEURONS = [
  { id: 'content.writer', short: 'writer', what: 'Writes long-form articles, reviews and guides on the reasoning tier.', tags: ['content.long_form', 'content.write'] },
  { id: 'content.publisher', short: 'publisher', what: 'Publishes to blogs and social platforms: API first, browser as fallback, then escalate.', tags: ['content.publish', 'web.publish'] },
  { id: 'browser.operator', short: 'browser', what: 'A general-purpose browser body for sites without an API. Captchas go to the owner.', tags: ['web.operate', 'web.signup'] },
  { id: 'accounts.manager', short: 'accounts', what: 'Signs up for services, refreshes tokens and stores credentials in the vault.', tags: ['accounts.manage', 'vault.write'] },
  { id: 'ads.manager', short: 'ads', what: 'Creates, pauses and budgets ad campaigns across the major networks.', tags: ['ads.manage', 'treasury.observe'] },
  { id: 'trading.operator', short: 'trading', what: 'Places exchange orders. Highest-risk neuron; it can never sign a payment itself.', tags: ['trading.operate', 'treasury.observe'], risk: true },
  { id: 'support.responder', short: 'support', what: 'Triages and answers tickets and DMs; legal, abuse and billing go to the owner.', tags: ['support.respond', 'content.write'] },
  { id: 'analytics.measurer', short: 'analytics', what: 'Pulls metrics and computes ROI so the reflect step learns what worked.', tags: ['analytics.measure', 'web.read'] },
  { id: 'research.scout', short: 'research', what: 'Finds niches and opportunities: search API first, browser fallback, then synthesis.', tags: ['research.scout', 'web.read'] },
  { id: 'payments.facilitator', short: 'payments', what: 'The only neuron allowed to move money. Every payment passes the treasury gate first.', tags: ['treasury.write', 'payments.send'], special: 'Sole treasury writer' },
  { id: 'infrastructure.provisioner', short: 'infra', what: 'Asks the platform for databases, storage buckets and vector stores.', tags: ['infra.provision'] },
  { id: 'vault.writer', short: 'vault', what: 'The single audited path for writing secrets into the Darwin\'s vault.', tags: ['vault.write'] },
  { id: 'compliance.kyc_submitter', short: 'kyc', what: 'Submits identity paperwork, unlocked only by a one-time owner grant.', tags: ['compliance.submit'] },
]

const selected = ref(9) // open on the payments neuron: the most important boundary
const current = computed(() => NEURONS[selected.value]!)
const nodes = NEURONS.map((n, i) => {
  const a = (i / NEURONS.length) * Math.PI * 2 - Math.PI / 2
  return { ...n, x: 250 + Math.cos(a) * 196, y: 250 + Math.sin(a) * 196 }
})

function pick(i: number) {
  if (i === selected.value) return
  selected.value = i
  audio.blip(1 + i * 0.05)
}

const NOTES: [string, string][] = [
  ['Contract', 'name · version · capability tags · cost estimate (p50/p95 USD and latency) · failure modes; async plan / execute / escalate'],
  ['NeuronContext', 'darwin id, a tier-only LLM handle, the audit logger, a vault view scoped to its tags, relevant lessons'],
  ['Never sees', 'the genome, the treasury key, other neurons\' state, the orchestrator\'s memory'],
  ['Routing', 'tags must cover the task → cheapest that meets the bar → most recent success → else file a capability request'],
  ['Isolation', 'a fresh Firecracker microVM per dispatch; only the egress proxy is reachable'],
  ['Self-authored neurons', 'off by default; when enabled every new neuron still needs human review'],
]
</script>

<template>
  <section id="neurons" data-chapter="neurons" class="lp-section">
    <div class="lp-container">
      <div class="lab-head">
        <div>
          <div class="upper dim lab-eyebrow">§ 05 — Neurons</div>
          <h2 class="lp-h2 reveal">Thirteen <em class="lp-ember-deep">narrow</em> minds.</h2>
        </div>
        <p class="lab-lead reveal">
          No god-agent. The soma decides <em>what</em> to do and hands each job to a narrow worker
          that can do exactly one kind of thing. A neuron only gets the capabilities its tags
          allow — the writer can't spend, and only one neuron can move money.
        </p>
      </div>

      <div class="nc-grid">
        <div class="nc-map reveal">
          <svg viewBox="0 0 500 500" aria-hidden="true">
            <line
              v-for="(n, i) in nodes"
              :key="`l-${n.id}`"
              x1="250" y1="250" :x2="n.x" :y2="n.y"
              class="nc-link" :class="{ 'is-active': i === selected }"
            />
            <circle cx="250" cy="250" r="54" class="nc-core" />
            <text x="250" y="246" class="nc-core-label">soma</text>
            <text x="250" y="262" class="nc-core-sub">orchestrator</text>
            <g
              v-for="(n, i) in nodes"
              :key="n.id"
              class="nc-node"
              :class="{ 'is-active': i === selected, 'is-special': n.special, 'is-risk': n.risk }"
              @mouseenter="pick(i)"
              @click="pick(i)"
            >
              <circle :cx="n.x" :cy="n.y" r="13" />
              <text :x="n.x" :y="n.y + (n.y > 250 ? 30 : -22)">{{ n.short }}</text>
            </g>
          </svg>
        </div>

        <div>
          <div class="nc-card" aria-live="polite">
            <div class="mono nc-card-id">{{ current.id }}</div>
            <p class="nc-card-what">{{ current.what }}</p>
            <div class="nc-tags">
              <span v-for="t in current.tags" :key="t" class="lab-chip">{{ t }}</span>
              <span v-if="current.special" class="lab-chip nc-special">★ {{ current.special }}</span>
              <span v-if="current.risk" class="lab-chip nc-risk">high risk · never signs</span>
            </div>
          </div>

          <div class="nc-list">
            <button
              v-for="(n, i) in NEURONS"
              :key="n.id"
              type="button"
              class="nc-pill mono"
              :class="{ 'is-active': i === selected }"
              :aria-pressed="i === selected"
              @click="pick(i)"
              @focus="pick(i)"
            >{{ n.id }}</button>
          </div>

          <LandingLabNotes title="Neuron contract" :items="NOTES" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.nc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
.nc-map svg { width: 100%; max-width: 560px; display: block; margin: 0 auto; overflow: visible; }
.nc-link { stroke: var(--darwin-border); stroke-width: 1; transition: stroke 0.3s; }
.nc-link.is-active { stroke: var(--darwin-accent); stroke-width: 1.5; stroke-dasharray: 4 6; animation: nc-flow 0.8s linear infinite; }
@keyframes nc-flow { to { stroke-dashoffset: -10; } }
.nc-core { fill: var(--darwin-ink); }
.nc-core-label { fill: var(--darwin-bg); font-size: 16px; font-style: italic; text-anchor: middle; }
.nc-core-sub { fill: var(--darwin-muted-2); font-family: var(--darwin-font-mono); font-size: 8px; text-anchor: middle; letter-spacing: 0.1em; text-transform: uppercase; }
.nc-node { cursor: pointer; }
.nc-node circle { fill: var(--darwin-bg); stroke: var(--darwin-ink); stroke-width: 1.2; transition: all 0.3s; }
.nc-node text { font-family: var(--darwin-font-mono); font-size: 10px; text-anchor: middle; fill: var(--darwin-ink-soft); }
.nc-node.is-special circle { stroke: var(--darwin-accent-deep); stroke-width: 2; }
.nc-node.is-risk circle { stroke-dasharray: 3 2; }
.nc-node.is-active circle { fill: var(--darwin-accent); stroke: var(--darwin-accent); }
.nc-node.is-active text { fill: var(--darwin-ink); font-weight: 600; }

.nc-card { padding: 28px; border: 1px solid var(--darwin-border); background: rgba(243, 238, 226, 0.7); backdrop-filter: blur(8px); min-height: 190px; margin-bottom: 24px; }
.nc-card-id { font-size: 18px; margin-bottom: 12px; color: var(--darwin-accent-deep); }
.nc-card-what { font-size: 17px; line-height: 1.55; margin-bottom: 18px; }
.nc-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.nc-special { background: var(--darwin-accent); color: var(--darwin-ink); border-color: var(--darwin-accent); }
.nc-risk { color: #b42318; }
.nc-list { display: flex; flex-wrap: wrap; gap: 6px; }
.nc-pill {
  font-size: 11px; padding: 6px 10px; border-radius: 100px; cursor: pointer;
  border: 1px solid var(--darwin-border); background: transparent; color: var(--darwin-ink-soft); transition: all 0.2s;
}
.nc-pill:hover { border-color: var(--darwin-ink); color: var(--darwin-ink); }
.nc-pill.is-active { background: var(--darwin-ink); color: var(--darwin-bg); border-color: var(--darwin-ink); }
@media (max-width: 1024px) { .nc-grid { grid-template-columns: 1fr; gap: 32px; } .nc-map svg { max-width: 420px; } }
@media (prefers-reduced-motion: reduce) { .nc-link.is-active { animation: none; } }
</style>
