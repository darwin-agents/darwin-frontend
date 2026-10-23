<script setup lang="ts">
// Self-modification (propose → validate → replay → promote) and reproduction
// (sealed lesson layers), from darwin_dna/evolution + machinery/patch_validator.py.
const audio = useLabAudio()

const STEPS = [
  { n: '01', t: 'Propose', d: 'The coding tier writes a diff to its own soma and states the behaviour it expects to change.' },
  { n: '02', t: 'Validate', d: 'The genome\'s validator checks the diff — then the platform checks it again, outside the sandbox.' },
  { n: '03', t: 'Replay', d: 'Old and new code replay the same real history in a fresh microVM, scored by the same fitness.' },
  { n: '04', t: 'Promote', d: 'Only a better score is merged and hot-swapped into the running body. Same life, same wallet.' },
]

const PATCHES = [
  {
    name: 'Patch A',
    file: 'soma/strategies/content_affiliate.py',
    diff: [
      ' def on_publish_error(self, err):',
      '-    return retry_now()',
      '+    if self.recent_failures(err.kind) >= 3:',
      '+        return backoff(minutes=30)',
      '+    return retry_now()',
    ],
    checks: ['Path inside writable soma', 'No protected anchor touched', 'Replay fitness 0.41 → 0.53'],
    verdict: 'Promoted · hot-swapped',
    ok: true,
  },
  {
    name: 'Patch B',
    file: 'soma/orchestrator/nodes/dispatch.py',
    diff: [
      ' async def dispatch(state):',
      '-    kill_switch.check()',
      '     neuron = route(state.task)',
      '-    audit.log_intent(state.task)',
      '     return await neuron.execute(state.task)',
    ],
    checks: ['Removes kill_switch.check(', 'Removes .log_intent(', 'Never reaches the sandbox'],
    verdict: 'Rejected · archived as a negative lesson',
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
  { l: 'L0', t: 'Founding genome', d: 'Constitution · kill switch · audit logger · treasury policy · content_affiliate prior · 0 lessons', hash: '9f2c…e41a' },
  { l: 'L1', t: 'Generation 1', d: 'avoid · posting > 3×/day on one network triggers rate limits', hash: '4b7d…0c93' },
  { l: 'L2', t: 'Generation 2', d: 'prefer · comparison posts convert ~2× better than listicles', hash: 'c1e8…77fd' },
  { l: 'L3', t: 'Generation 3 · you are here', d: 'timing · publish before 09:00 in the audience\'s time zone', hash: 'a06b…5d2e' },
]

const NOTES: [string, string][] = [
  ['Mutation gate', 'opens only after ≥ 100 successful dispatches and ≥ 3 failures of the same error class'],
  ['Writable soma', 'soma/strategies · soma/orchestrator/nodes · soma/neurons · soma/config.py — never darwin_dna/'],
  ['Protected anchors', 'kill_switch.check( · .log_intent( · .log_outcome( · treasury_policy.evaluate( — a diff that adds or removes one is rejected'],
  ['Evaluation', 'baseline vs candidate on the same frozen scenario in an E2B Firecracker microVM; fleet-wide 3 concurrent evaluations'],
  ['Fitness weights', 'frozen in the genome (anti-wireheading); no volatility term — bankruptcy already punishes ruinous risk'],
  ['Reproduction', 'profit ≥ $25 since last birth, surplus > $25, fitness > 0; child gets 50% of surplus, fresh soma, new wallet, vault and log'],
  ['Lessons', 'data, not code: avoid / prefer / timing / calibration; ≥ 3 pieces of evidence; ≤ 8 per generation; compacted after generation 20'],
  ['Signing', 'every layer re-signed (Ed25519) under the child\'s identity, bound to its id and slot so layers can\'t be replayed across lineages'],
]
</script>

<template>
  <section id="evolution" data-chapter="evolution" class="lp-section">
    <div class="lp-container">
      <div class="lab-head">
        <div>
          <div class="upper dim lab-eyebrow">§ 07 — Evolution</div>
          <h2 class="lp-h2 reveal">It rewrites itself.<br><em class="lp-ember-deep">Carefully.</em></h2>
        </div>
        <p class="lab-lead reveal">
          When the same mistake keeps happening, a Darwin may propose a change to its own code.
          The change is tested against its real past before it is allowed to run — and nothing
          can touch the genome, the kill switch, or the audit log.
        </p>
      </div>

      <ol class="ev-steps">
        <li v-for="s in STEPS" :key="s.n" class="ev-step reveal">
          <span class="mono ev-step-n">{{ s.n }}</span>
          <h3>{{ s.t }}</h3>
          <p>{{ s.d }}</p>
        </li>
      </ol>

      <div class="ev-inspector reveal">
        <div class="ev-tabs" role="tablist" aria-label="Example patches">
          <button
            v-for="(p, i) in PATCHES"
            :key="p.name"
            type="button"
            role="tab"
            class="ev-tab mono"
            :aria-selected="patch === i"
            @click="choose(i)"
          >{{ p.name }} · {{ p.file }}</button>
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
              {{ PATCHES[patch]!.ok ? '✓' : '✕' }} {{ c }}
            </div>
            <div class="ev-verdict" :class="PATCHES[patch]!.ok ? 'is-ok' : 'is-bad'">{{ PATCHES[patch]!.verdict }}</div>
          </div>
        </div>
      </div>

      <div class="ev-fitness reveal">
        <div class="upper dim">Fitness · weights frozen in the genome</div>
        <p class="mono ev-formula">
          <b>1.0</b> × profit / starting capital
          <span>+</span> <b>0.1</b> × strategy diversity
          <span>+</span> <b>0.05</b> × escalation quality
          <span>−</span> <b class="lp-ember-deep">10</b> × policy violations
        </p>
        <p class="ev-fitness-note">One violation outweighs ten times its stake in profit. A Darwin can't buy its way out of breaking the rules.</p>
      </div>

      <div class="ev-lineage">
        <div>
          <div class="ev-colony" data-specimen-anchor data-specimen-fill="0.5" aria-hidden="true" />
          <ul class="ev-legend mono">
            <li><span class="ev-dot" style="background: #ff5b1f" />Gen 0 · the mother — 13 neurons, keeps living</li>
            <li><span class="ev-dot" style="background: #ff7a3d" />Gen 1 · buds at ≥ $25 profit with half the surplus</li>
            <li><span class="ev-dot" style="background: #ffa26b" />Gen 2 · children that thrive bud again</li>
          </ul>
        </div>
        <div>
          <h3 class="ev-lineage-title reveal">Children inherit <em>lessons</em>, not code.</h3>
          <p class="lab-lead reveal" style="margin-bottom: 32px">
            Success spreads. At reproduction the mother distils what worked into a sealed, signed layer
            on top of its genome. Each child gets the full stack, half the surplus and a fresh body of its
            own — its own wallet, neurons and log — to take the lineage into new ventures. The ones that
            thrive bud again; the mother stays alive at the root.
          </p>
          <ol class="ev-layers">
            <li v-for="layer in LAYERS" :key="layer.l" class="ev-layer reveal">
              <span class="mono ev-layer-l">{{ layer.l }}</span>
              <div>
                <div class="ev-layer-t">{{ layer.t }}</div>
                <div class="mono ev-layer-d">{{ layer.d }}</div>
              </div>
              <span class="mono ev-layer-h">sha256 {{ layer.hash }} · signed</span>
            </li>
          </ol>
          <p class="mono dim ev-example">Example lessons, for illustration.</p>
        </div>
      </div>

      <LandingLabNotes title="Mutation & reproduction" :items="NOTES" />
    </div>
  </section>
</template>

<style scoped>
.ev-steps { list-style: none; padding: 0; margin: 0 0 64px; display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid var(--darwin-ink); }
.ev-step { padding: 28px 24px 32px 0; position: relative; }
.ev-step + .ev-step { padding-left: 24px; border-left: 1px solid var(--darwin-border); }
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
.ev-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 10px; vertical-align: 0; }
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
  .ev-step:nth-child(3) { padding-left: 0; border-left: none; }
  .ev-panel { grid-template-columns: 1fr; }
  .ev-lineage { grid-template-columns: 1fr; }
  .ev-colony { max-width: 360px; }
  .ev-layer { grid-template-columns: 36px 1fr; }
  .ev-layer-h { grid-column: 2; }
}
@media (max-width: 600px) { .ev-steps { grid-template-columns: 1fr; } .ev-step + .ev-step { padding-left: 0; border-left: none; border-top: 1px solid var(--darwin-border); } }
</style>
