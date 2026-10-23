<script setup lang="ts">
// Sticky scroll story: six lifecycle stages scrubbed by scroll position.
// The ring is the real orchestrator graph (darwin_dna/orchestrator_skeleton/nodes).
const { active, stage } = useLabChapter()
const audio = useLabAudio()
const root = useTemplateRef<HTMLElement>('root')

const STAGES = [
  {
    title: 'Birth',
    body: 'You choose a starting budget. The Darwin boots from a signed genome it can read but never change, and verifies that signature on every start.',
    fact: 'genome Ed25519-signed · mounted read-only · verified every boot',
    balance: 100,
    nodes: [] as string[],
  },
  {
    title: 'Heartbeat',
    body: 'Every 30 seconds it wakes, checks it is still allowed to live, reads its treasury, plans one move, acts through a single neuron, then reflects on what happened.',
    fact: 'check_death → perceive → plan → dispatch → reflect · every 30 s (5 s–10 min, learned)',
    balance: 99.62,
    nodes: ['check_death', 'perceive', 'plan', 'dispatch', 'reflect', 'check_reproduction'],
  },
  {
    title: 'Metabolism',
    body: 'Everything costs money: tokens, compute, APIs, ads. Revenue from the ventures its neurons run is food. Every spend is capped before it happens, not after.',
    fact: '$50 per action · $500 per day · $10,000 per lifetime · owners can only tighten',
    balance: 131.4,
    nodes: ['dispatch'],
  },
  {
    title: 'Escalation',
    body: 'A captcha, an ID check, a large payment: when only a human can help, it parks that task and asks you. It never pushes through. Escalate, don\'t fail.',
    fact: 'captcha 15 min · KYC 72 h · approval 24 h · no answer = deny',
    balance: 131.4,
    nodes: ['dispatch', 'perceive'],
  },
  {
    title: 'Reproduction',
    body: 'Profitable over a week? It buds a child: its genome plus one sealed layer of lessons, and half its surplus. Children that thrive bud their own. The mother keeps living at the root of the lineage.',
    fact: '≥ $25 profit · 50% of surplus per child · ≥ 3 pieces of evidence per lesson · ≤ 8 lessons per generation',
    balance: 78.2,
    nodes: ['check_reproduction'],
  },
  {
    title: 'Death',
    body: 'Below $1 with no revenue for 24 hours, it dies. Or you pull the kill switch. No resurrection, no bailouts. Most Darwins will die; the lineages that survive are the point.',
    fact: 'balance < $1 + 24 h grace · kill switch halts ≤ 5 s · logs kept ≥ 90 days',
    balance: 0.84,
    nodes: ['check_death'],
  },
]

const RING = [
  'check_death', 'perceive', 'plan', 'dispatch', 'reflect',
  'propose_mutation', 'evaluate_mutation', 'apply_mutation', 'check_reproduction',
]
const ringNodes = RING.map((name, i) => {
  const a = (i / RING.length) * Math.PI * 2 - Math.PI / 2
  return { name, x: 200 + Math.cos(a) * 168, y: 200 + Math.sin(a) * 168, right: Math.cos(a) >= 0, a }
})

const current = computed(() => STAGES[stage.value] ?? STAGES[0]!)
const shownBalance = ref(100)
const SOUNDS = [audio.chime, audio.heartbeat, () => audio.blip(1.3), audio.ping, audio.chime, audio.flatline]

// Tween the balance readout toward the stage's value.
let raf = 0
watch(stage, (s, prev) => {
  if (active.value === 'lifecycle' && s !== prev) SOUNDS[s]?.()
  cancelAnimationFrame(raf)
  const from = shownBalance.value
  const to = STAGES[s]?.balance ?? 0
  const t0 = performance.now()
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / 600)
    shownBalance.value = from + (to - from) * (1 - (1 - k) ** 3)
    if (k < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
})

function sectionRange() {
  const el = root.value!
  const top = el.getBoundingClientRect().top + window.scrollY
  return { top, span: el.offsetHeight - window.innerHeight }
}

let ticking = false
function onScroll() {
  if (ticking || !root.value) return
  ticking = true
  requestAnimationFrame(() => {
    ticking = false
    const r = root.value!.getBoundingClientRect()
    const span = r.height - window.innerHeight
    if (r.top > window.innerHeight || r.bottom < 0 || span <= 0) return
    const p = Math.min(1, Math.max(0, -r.top / span))
    const s = Math.min(STAGES.length - 1, Math.floor(p * STAGES.length))
    if (s !== stage.value) stage.value = s
  })
}

function goTo(i: number) {
  const { top, span } = sectionRange()
  window.scrollTo({ top: top + ((i + 0.5) / STAGES.length) * span, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  cancelAnimationFrame(raf)
})
</script>

<template>
  <section id="lifecycle" ref="root" data-chapter="lifecycle" class="lc lab-dark">
    <div class="lc-sticky">
      <div class="lp-container lc-grid">
        <div class="lc-copy">
          <div class="upper lab-eyebrow">§ 03 — Lifecycle</div>
          <h2 class="lp-h2 lc-title">Born with a budget.<br>Dies at <em class="lp-ember">zero</em>.</h2>

          <ol class="lc-steps">
            <li v-for="(s, i) in STAGES" :key="s.title">
              <button
                type="button"
                class="lc-step"
                :class="{ 'is-active': i === stage, 'is-past': i < stage }"
                :aria-current="i === stage ? 'step' : undefined"
                @click="goTo(i)"
              >
                <span class="mono">{{ String(i + 1).padStart(2, '0') }}</span>
                {{ s.title }}
              </button>
            </li>
          </ol>

          <Transition name="lc-card" mode="out-in">
            <div :key="stage" class="lc-card" aria-live="polite">
              <h3 class="lc-card-title">{{ current.title }}</h3>
              <p class="lc-card-body">{{ current.body }}</p>
              <p class="mono lc-card-fact">{{ current.fact }}</p>
            </div>
          </Transition>
        </div>

        <div class="lc-instrument">
          <div class="lc-ring" data-specimen-anchor data-specimen-fill="0.5">
            <svg viewBox="0 0 400 400" aria-hidden="true">
              <circle cx="200" cy="200" r="168" class="lc-orbit" />
              <g class="lc-pulse" :class="{ 'is-fast': stage === 1, 'is-stopped': stage === 5 }">
                <circle cx="200" cy="32" r="5" class="lc-pulse-dot" />
              </g>
              <g v-for="n in ringNodes" :key="n.name" :class="{ 'is-lit': current.nodes.includes(n.name) }" class="lc-node">
                <circle :cx="n.x" :cy="n.y" r="6" />
                <text
                  :x="n.x + Math.cos(n.a) * 16"
                  :y="n.y + Math.sin(n.a) * 16 + 3"
                  :text-anchor="Math.abs(Math.cos(n.a)) < 0.2 ? 'middle' : n.right ? 'start' : 'end'"
                >{{ n.name }}</text>
              </g>
            </svg>
          </div>
          <div class="lc-readout mono">
            <div>
              <div class="dim">Treasury</div>
              <div class="lc-balance" :class="{ 'is-low': stage === 5 }">${{ shownBalance.toFixed(2) }}</div>
            </div>
            <div>
              <div class="dim">Stage</div>
              <div class="lc-stage">{{ String(stage + 1).padStart(2, '0') }} / 06</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.lc { height: 600vh; position: relative; }
.lc-sticky { position: sticky; top: 0; height: 100vh; height: 100dvh; display: flex; align-items: center; }
.lc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; width: 100%; }
.lc-title { margin-bottom: 40px; font-size: clamp(40px, 5.2vw, 84px); }
.lc-steps { display: flex; flex-wrap: wrap; gap: 6px; list-style: none; padding: 0; margin: 0 0 32px; }
.lc-step {
  display: inline-flex; gap: 8px; align-items: center; padding: 8px 14px; border-radius: 100px;
  font-size: 12px; color: rgba(243, 238, 226, 0.55); background: transparent;
  border: 1px solid rgba(243, 238, 226, 0.14); cursor: pointer; transition: all 0.3s;
}
.lc-step.is-past { color: rgba(243, 238, 226, 0.8); }
.lc-step.is-active { background: var(--darwin-accent); color: var(--darwin-ink); border-color: var(--darwin-accent); }
.lc-card { min-height: 220px; max-width: 520px; }
.lc-card-title { font-size: 34px; font-style: italic; letter-spacing: -0.02em; margin-bottom: 14px; }
.lc-card-body { font-size: 17px; line-height: 1.6; color: rgba(243, 238, 226, 0.78); margin-bottom: 18px; }
.lc-card-fact { font-size: 11px; letter-spacing: 0.04em; color: var(--darwin-accent); line-height: 1.7; }
.lc-card-enter-active, .lc-card-leave-active { transition: opacity 0.3s, transform 0.3s; }
.lc-card-enter-from { opacity: 0; transform: translateY(14px); }
.lc-card-leave-to { opacity: 0; transform: translateY(-10px); }

.lc-instrument { display: flex; flex-direction: column; align-items: center; gap: 20px; }
.lc-ring { width: min(64vh, 40vw, 560px); aspect-ratio: 1; }
.lc-ring svg { width: 100%; height: 100%; overflow: visible; }
.lc-orbit { fill: none; stroke: rgba(243, 238, 226, 0.14); stroke-dasharray: 2 6; }
.lc-node circle { fill: #0a0a0a; stroke: rgba(243, 238, 226, 0.35); stroke-width: 1.2; transition: all 0.4s; }
.lc-node text { font-family: var(--darwin-font-mono); font-size: 10px; fill: rgba(243, 238, 226, 0.4); transition: fill 0.4s; }
.lc-node.is-lit circle { fill: var(--darwin-accent); stroke: var(--darwin-accent); filter: drop-shadow(0 0 6px var(--darwin-accent)); }
.lc-node.is-lit text { fill: var(--darwin-bg); }
.lc-pulse { transform-origin: 200px 200px; animation: lc-spin 6s linear infinite; }
.lc-pulse.is-fast { animation-duration: 2.2s; }
.lc-pulse.is-stopped { animation-play-state: paused; opacity: 0.2; }
.lc-pulse-dot { fill: var(--darwin-accent); filter: drop-shadow(0 0 8px var(--darwin-accent)); }
@keyframes lc-spin { to { transform: rotate(360deg); } }

.lc-readout { display: flex; gap: 48px; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; }
.lc-balance { font-size: 28px; letter-spacing: -0.01em; color: var(--darwin-bg); text-transform: none; margin-top: 4px; }
.lc-balance.is-low { color: #ff8a5b; }
.lc-stage { font-size: 28px; margin-top: 4px; color: var(--darwin-bg); }

@media (max-width: 900px) {
  .lc { height: 520vh; }
  .lc-grid { grid-template-columns: 1fr; gap: 12px; }
  .lc-title { margin-bottom: 16px; font-size: 40px; }
  .lc-steps { margin-bottom: 14px; }
  .lc-step { padding: 6px 10px; font-size: 11px; }
  .lc-card { min-height: 0; }
  .lc-card-title { font-size: 24px; margin-bottom: 6px; }
  .lc-card-body { font-size: 14px; margin-bottom: 8px; }
  .lc-ring { width: min(34vh, 80vw); }
  .lc-node text { display: none; }
  .lc-readout { gap: 28px; }
  .lc-balance, .lc-stage { font-size: 20px; }
}
@media (prefers-reduced-motion: reduce) { .lc-pulse { animation: none; } }
</style>
