<script setup lang="ts">
// Self-modification (propose → validate → replay → promote) and reproduction
// (sealed lesson layers), from darwin_dna/evolution + machinery/patch_validator.py.
const { t } = useI18n()
const audio = useLabAudio()

const STEPS = [
  { n: '01', id: 'propose' },
  { n: '02', id: 'validate' },
  { n: '03', id: 'replay' },
  { n: '04', id: 'promote' },
]

const PATCHES = [
  {
    id: 'a',
    file: 'soma/strategies/content_affiliate.py',
    diff: [
      ' def on_publish_error(self, err):',
      '-    return retry_now()',
      '+    if self.recent_failures(err.kind) >= 3:',
      '+        return backoff(minutes=30)',
      '+    return retry_now()',
    ],
    checks: ['writablePath', 'noAnchor', 'replayFitness'],
    ok: true,
  },
  {
    id: 'b',
    file: 'soma/orchestrator/nodes/dispatch.py',
    diff: [
      ' async def dispatch(state):',
      '-    kill_switch.check()',
      '     neuron = route(state.task)',
      '-    audit.log_intent(state.task)',
      '     return await neuron.execute(state.task)',
    ],
    checks: ['removesKillSwitch', 'removesLogIntent', 'neverSandbox'],
    ok: false,
  },
]
const patch = ref(0)
function choose(i: number) {
  patch.value = i
  if (PATCHES[i]!.ok) audio.chime()
  else audio.buzz()
}

const LAYERS = [
  { l: 'L0', id: 'l0', hash: '9f2c…e41a' },
  { l: 'L1', id: 'l1', hash: '4b7d…0c93' },
  { l: 'L2', id: 'l2', hash: 'c1e8…77fd' },
  { l: 'L3', id: 'l3', hash: 'a06b…5d2e' },
]

const NOTE_IDS = ['mutationGate', 'writableSoma', 'protectedAnchors', 'evaluation', 'fitnessWeights', 'reproduction', 'lessons', 'signing']
const notes = computed(() => NOTE_IDS.map((id): [string, string] => [t(`lab.evolution.notes.${id}.term`), t(`lab.evolution.notes.${id}.value`)]))
</script>

<template>
  <section id="evolution" data-chapter="evolution" class="lp-section">
    <div class="lp-container">
      <div class="lab-head">
        <div>
          <div class="upper dim lab-eyebrow">{{ t('lab.evolution.eyebrow') }}</div>
          <i18n-t keypath="lab.evolution.title" tag="h2" class="lp-h2 reveal" scope="global">
            <template #br><br></template>
            <template #em><em class="lp-ember-deep">{{ t('lab.evolution.titleEm') }}</em></template>
          </i18n-t>
        </div>
        <p class="lab-lead reveal">{{ t('lab.evolution.lead') }}</p>
      </div>

      <ol class="ev-steps">
        <li v-for="s in STEPS" :key="s.n" class="ev-step reveal">
          <span class="mono ev-step-n">{{ s.n }}</span>
          <h3>{{ t(`lab.evolution.steps.${s.id}.title`) }}</h3>
          <p>{{ t(`lab.evolution.steps.${s.id}.body`) }}</p>
        </li>
      </ol>

      <div class="ev-inspector reveal">
        <div class="ev-tabs" role="tablist" :aria-label="t('lab.evolution.patchesLabel')">
          <button
            v-for="(p, i) in PATCHES"
            :key="p.id"
            type="button"
            role="tab"
            class="ev-tab mono"
            :aria-selected="patch === i"
            @click="choose(i)"
          >{{ t(`lab.evolution.patches.${p.id}.name`) }} · {{ p.file }}</button>
        </div>
        <div class="ev-panel" role="tabpanel">
          <pre class="ev-diff mono"><code><span
            v-for="(line, k) in PATCHES[patch]!.diff"
            :key="k"
            :class="line.startsWith('+') ? 'is-add' : line.startsWith('-') ? 'is-del' : ''"
          >{{ line }}
</span></code></pre>
          <div class="ev-checks">
            <div v-for="c in PATCHES[patch]!.checks" :key="c" class="mono ev-check" :class="PATCHES[patch]!.ok ? 'is-ok' : 'is-bad'">
              {{ PATCHES[patch]!.ok ? '✓' : '✕' }} {{ t(`lab.evolution.patches.${PATCHES[patch]!.id}.checks.${c}`) }}
            </div>
            <div class="ev-verdict" :class="PATCHES[patch]!.ok ? 'is-ok' : 'is-bad'">{{ t(`lab.evolution.patches.${PATCHES[patch]!.id}.verdict`) }}</div>
          </div>
        </div>
      </div>

      <div class="ev-fitness reveal">
        <div class="upper dim">{{ t('lab.evolution.fitness.label') }}</div>
        <p class="mono ev-formula">
          <b>1.0</b> × {{ t('lab.evolution.fitness.terms.profit') }}
          <span>+</span> <b>0.1</b> × {{ t('lab.evolution.fitness.terms.diversity') }}
          <span>+</span> <b>0.05</b> × {{ t('lab.evolution.fitness.terms.escalation') }}
          <span>−</span> <b class="lp-ember-deep">10</b> × {{ t('lab.evolution.fitness.terms.violations') }}
        </p>
        <p class="ev-fitness-note">{{ t('lab.evolution.fitness.note') }}</p>
      </div>

      <div class="ev-lineage">
        <div>
          <div class="ev-colony" data-specimen-anchor data-specimen-fill="0.5" aria-hidden="true" />
          <ul class="ev-legend mono">
            <li><span class="ev-dot" style="background: #ff5b1f" />{{ t('lab.evolution.legend.gen0') }}</li>
            <li><span class="ev-dot" style="background: #ff7a3d" />{{ t('lab.evolution.legend.gen1') }}</li>
            <li><span class="ev-dot" style="background: #ffa26b" />{{ t('lab.evolution.legend.gen2') }}</li>
          </ul>
        </div>
        <div>
          <i18n-t keypath="lab.evolution.lineage.title" tag="h3" class="ev-lineage-title reveal" scope="global">
            <template #em><em>{{ t('lab.evolution.lineage.titleEm') }}</em></template>
          </i18n-t>
          <p class="lab-lead reveal" style="margin-bottom: 32px">{{ t('lab.evolution.lineage.lead') }}</p>
          <ol class="ev-layers">
            <li v-for="layer in LAYERS" :key="layer.l" class="ev-layer reveal">
              <span class="mono ev-layer-l">{{ layer.l }}</span>
              <div>
                <div class="ev-layer-t">{{ t(`lab.evolution.layers.${layer.id}.title`) }}</div>
                <div class="mono ev-layer-d">{{ t(`lab.evolution.layers.${layer.id}.body`) }}</div>
              </div>
              <span class="mono ev-layer-h">{{ t('lab.evolution.layerHash', { hash: layer.hash }) }}</span>
            </li>
          </ol>
          <p class="mono dim ev-example">{{ t('lab.evolution.example') }}</p>
        </div>
      </div>

      <LandingLabNotes :title="t('lab.evolution.notesTitle')" :items="notes" />
    </div>
  </section>
</template>

<style scoped>
.ev-steps { list-style: none; padding: 0; margin: 0 0 64px; display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid var(--darwin-ink); }
.ev-step { padding: 28px 24px 32px 0; position: relative; }
.ev-step + .ev-step { padding-inline-start: 24px; border-inline-start: 1px solid var(--darwin-border); }
.ev-step-n { font-size: 11px; color: var(--darwin-accent-deep); }
.ev-step h3 { font-size: 28px; font-style: italic; letter-spacing: -0.02em; margin: 12px 0 10px; }
.ev-step p { font-size: 14px; line-height: 1.6; color: var(--darwin-ink-soft); }

.ev-inspector { border: 1px solid var(--darwin-ink); margin-bottom: 64px; background: var(--darwin-bg); }
.ev-tabs { display: flex; border-bottom: 1px solid var(--darwin-ink); overflow-x: auto; }
.ev-tab { padding: 14px 20px; font-size: 11px; background: transparent; border: none; cursor: pointer; color: var(--darwin-muted); white-space: nowrap; }
.ev-tab[aria-selected='true'] { background: var(--darwin-ink); color: var(--darwin-bg); }
.ev-panel { display: grid; grid-template-columns: 1.4fr 1fr; }
.ev-diff { margin: 0; padding: 24px; font-size: 12.5px; line-height: 1.8; background: #0a0a0a; color: #f3eee2; overflow-x: auto; }
.ev-diff .is-add { color: #7ad08f; }
.ev-diff .is-del { color: #ff8a5b; text-decoration: line-through; text-decoration-color: rgba(255, 138, 91, 0.5); }
.ev-checks { padding: 24px; display: flex; flex-direction: column; gap: 10px; }
.ev-check { font-size: 12px; }
.ev-check.is-ok { color: #1f8a3e; }
.ev-check.is-bad { color: #b42318; }
.ev-verdict { margin-top: auto; padding: 12px 16px; font-size: 14px; font-weight: 500; }
.ev-verdict.is-ok { background: #1f8a3e; color: #fff; }
.ev-verdict.is-bad { background: #b42318; color: #fff; }

.ev-fitness { padding: 40px; background: var(--darwin-ink); color: var(--darwin-bg); margin-bottom: 96px; }
.ev-formula { font-size: clamp(14px, 1.6vw, 20px); line-height: 1.9; margin: 16px 0; }
.ev-formula b { font-weight: 500; color: var(--darwin-accent); }
.ev-formula .lp-ember-deep { color: #ff8a5b; }
.ev-formula span { margin: 0 8px; opacity: 0.5; }
.ev-fitness-note { font-size: 15px; color: rgba(243, 238, 226, 0.7); }

.ev-lineage { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 64px; align-items: center; }
.ev-colony { aspect-ratio: 1; width: 100%; max-width: 560px; margin: 0 auto; }
.ev-legend { list-style: none; padding: 0; margin: 8px 0 0; font-size: 11px; line-height: 2; color: var(--darwin-ink-soft); }
.ev-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-inline-end: 10px; vertical-align: 0; }
.ev-lineage-title { font-size: clamp(32px, 3.6vw, 52px); letter-spacing: -0.03em; line-height: 1; margin-bottom: 20px; font-weight: 400; }
.ev-layers { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column-reverse; gap: 6px; }
.ev-layer { display: grid; grid-template-columns: 44px 1fr auto; gap: 16px; align-items: center; padding: 14px 18px; border: 1px solid var(--darwin-border); background: var(--darwin-bg); }
.ev-layer:last-child { border-color: var(--darwin-accent); box-shadow: 0 0 0 1px var(--darwin-accent); }
.ev-layer-l { font-size: 14px; color: var(--darwin-accent-deep); }
.ev-layer-t { font-size: 16px; }
.ev-layer-d { font-size: 11px; color: var(--darwin-muted); margin-top: 3px; }
.ev-layer-h { font-size: 10px; color: var(--darwin-muted); }
.ev-example { font-size: 10px; margin-top: 10px; }

@media (max-width: 1024px) {
  .ev-steps { grid-template-columns: repeat(2, 1fr); }
  .ev-step:nth-child(3) { padding-inline-start: 0; border-inline-start: none; }
  .ev-panel { grid-template-columns: 1fr; }
  .ev-lineage { grid-template-columns: 1fr; }
  .ev-colony { max-width: 360px; }
  .ev-layer { grid-template-columns: 36px 1fr; }
  .ev-layer-h { grid-column: 2; }
}
@media (max-width: 600px) { .ev-steps { grid-template-columns: 1fr; } .ev-step + .ev-step { padding-inline-start: 0; border-inline-start: none; border-top: 1px solid var(--darwin-border); } }
</style>
