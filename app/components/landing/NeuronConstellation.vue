<script setup lang="ts">
// The 13 built-in neurons registered in darwin_dna/neurons/_registry.py.
const { t } = useI18n()
const audio = useLabAudio()

const NEURONS = [
  { id: 'content.writer', short: 'writer', tags: ['content.long_form', 'content.write'] },
  { id: 'content.publisher', short: 'publisher', tags: ['content.publish', 'web.publish'] },
  { id: 'browser.operator', short: 'browser', tags: ['web.operate', 'web.signup'] },
  { id: 'accounts.manager', short: 'accounts', tags: ['accounts.manage', 'vault.write'] },
  { id: 'ads.manager', short: 'ads', tags: ['ads.manage', 'treasury.observe'] },
  { id: 'trading.operator', short: 'trading', tags: ['trading.operate', 'treasury.observe'], risk: true },
  { id: 'support.responder', short: 'support', tags: ['support.respond', 'content.write'] },
  { id: 'analytics.measurer', short: 'analytics', tags: ['analytics.measure', 'web.read'] },
  { id: 'research.scout', short: 'research', tags: ['research.scout', 'web.read'] },
  { id: 'payments.facilitator', short: 'payments', tags: ['treasury.write', 'payments.send'], special: true },
  { id: 'infrastructure.provisioner', short: 'infra', tags: ['infra.provision'] },
  { id: 'vault.writer', short: 'vault', tags: ['vault.write'] },
  { id: 'compliance.kyc_submitter', short: 'kyc', tags: ['compliance.submit'] },
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

const NOTE_IDS = ['contract', 'neuronContext', 'neverSees', 'routing', 'isolation', 'selfAuthored']
const notes = computed(() => NOTE_IDS.map((id): [string, string] => [t(`lab.neurons.notes.${id}.term`), t(`lab.neurons.notes.${id}.value`)]))
</script>

<template>
  <section id="neurons" data-chapter="neurons" class="lp-section">
    <div class="lp-container">
      <div class="lab-head">
        <div>
          <div class="upper dim lab-eyebrow">{{ t('lab.neurons.eyebrow') }}</div>
          <i18n-t keypath="lab.neurons.title" tag="h2" class="lp-h2 reveal" scope="global">
            <template #em><em class="lp-ember-deep">{{ t('lab.neurons.titleEm') }}</em></template>
          </i18n-t>
        </div>
        <i18n-t keypath="lab.neurons.lead" tag="p" class="lab-lead reveal" scope="global">
          <template #what><em>{{ t('lab.neurons.leadWhat') }}</em></template>
        </i18n-t>
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
            <text x="250" y="246" class="nc-core-label">{{ t('lab.neurons.core.label') }}</text>
            <text x="250" y="262" class="nc-core-sub">{{ t('lab.neurons.core.sub') }}</text>
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
            <p class="nc-card-what">{{ t(`lab.neurons.what.${current.short}`) }}</p>
            <div class="nc-tags">
              <span v-for="tag in current.tags" :key="tag" class="lab-chip">{{ tag }}</span>
              <span v-if="current.special" class="lab-chip nc-special">★ {{ t('lab.neurons.special') }}</span>
              <span v-if="current.risk" class="lab-chip nc-risk">{{ t('lab.neurons.risk') }}</span>
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

          <LandingLabNotes :title="t('lab.neurons.notesTitle')" :items="notes" />
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
