<script setup lang="ts">
definePageMeta({ layout: false })

const seoDescription =
  'Darwin Agents are autonomous economic organisms: a budget, a goal and a survival imperative. They earn, spend, reproduce or perish.'
useSeoMeta({
  title: 'The autonomous economic engine',
  description: seoDescription,
  ogTitle: 'Darwin Agents — the autonomous economic engine',
  ogDescription: seoDescription,
  ogType: 'website',
  twitterCard: 'summary',
})

// ── Live Ledger (Hero) ──────────────────────────────────────────────────────
interface LedgerRow {
  id: string
  action: string
  what: string
  amount: number
  fmt: string
  ts: number
}

const SEED_ROWS: LedgerRow[] = [
  { id: 'DRW-0142', action: 'spent',      what: 'vision pass',    amount: -7.74,   fmt: '$7.74',   ts: 1 },
  { id: 'DRW-0287', action: 'earned',     what: 'ad click',       amount: 319.60,  fmt: '$319.60', ts: 2 },
  { id: 'DRW-1334', action: 'spent',      what: 'proxy req',      amount: -3.64,   fmt: '$3.64',   ts: 3 },
  { id: 'DRW-1024', action: 'spent',      what: 'scrape worker',  amount: -7.51,   fmt: '$7.51',   ts: 4 },
  { id: 'DRW-0613', action: 'deployed →', what: '',               amount: 319,     fmt: '$319',    ts: 5 },
  { id: 'DRW-0822', action: 'billed',     what: 'ad campaign',    amount: 767.88,  fmt: '$767.88', ts: 6 },
]

function genRow(): LedgerRow {
  const actions: [string, string[], number][] = [
    ['spent',      ['vision pass', 'proxy req', 'scrape worker', 'gpt-4o', 'tool call'], -1],
    ['earned',     ['ad click', 'shopify sale', 'subscription', 'affiliate', 'api call'], 1],
    ['billed',     ['ad campaign', 'storefront', 'subscription'], 1],
    ['deployed →', [''], 1],
  ]
  const pick = actions[Math.floor(Math.random() * actions.length)]!
  const [action, whats, sign] = pick
  const what = whats[Math.floor(Math.random() * whats.length)] ?? ''
  const amount = sign * (Math.random() * (sign > 0 ? 800 : 12) + 0.5)
  return {
    id: 'DRW-' + Math.floor(Math.random() * 9000 + 100).toString().padStart(4, '0'),
    action, what, amount,
    fmt: '$' + Math.abs(amount).toFixed(2),
    ts: Date.now() + Math.random(),
  }
}

const ledgerRows = ref<LedgerRow[]>([...SEED_ROWS])
const stats = ref({ alive: 1208, revenue: 110700, perished: 9126 })

// ── Canvas Feed ─────────────────────────────────────────────────────────────
interface FeedEvent {
  k: number
  ts: string
  id: string
  verb: string
  what: string
  amount: number
}

function randEvent(): FeedEvent {
  const verbs: [string, string[], number][] = [
    ['paid',       ['gpt-4o', 'proxy', 'browser sandbox', 'embeddings'], -1],
    ['earned',     ['ad click', 'sub renewal', 'shopify sale', 'API call'], 1],
    ['forked →',   [''], 1],
    ['retired ✕',  [''], -1],
  ]
  const vpick = verbs[Math.floor(Math.random() * verbs.length)]!
  const [verb, whats, sign] = vpick
  const what = whats[Math.floor(Math.random() * whats.length)] ?? ''
  const amount = sign * (Math.random() * (sign > 0 ? 600 : 9) + 0.4)
  const t = new Date()
  return {
    k: Math.random(),
    ts: `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')}`,
    id: 'DRW-' + Math.floor(Math.random() * 9000 + 100).toString().padStart(4, '0'),
    verb, what, amount,
  }
}

// Seeded on mount: random rows rendered during SSR would never match the client.
const canvasFeed = ref<FeedEvent[]>([])

// ── Anatomy ──────────────────────────────────────────────────────────────────
const anatomyActive = ref(0)
const anatomyItems: { i: string; t: string; d: string }[] = [
  { i: 'I',   t: 'Goal Engine',         d: 'Auto-generates mid- and long-term objectives from a starting prompt. Re-prioritizes when reality disagrees.' },
  { i: 'II',  t: 'Internet Body',       d: 'Browser, vision, scraping, API tool-use. Operates on the same web humans operate on — no curated sandbox.' },
  { i: 'III', t: 'Treasury',            d: 'On-chain wallet. Pays for compute, tools, and ad spend. Bills its own customers. Bankruptcy is real.' },
  { i: 'IV',  t: 'Memory Core',         d: 'Episodic + crystallized embeddings. Successful strategies persist; failed ones are pruned.' },
  { i: 'V',   t: 'Reproductive Layer',  d: 'Profitable agents fork with mutations. Unprofitable lineages return their stake to the substrate pool.' },
]
const activeItem = computed(() => anatomyItems[anatomyActive.value] ?? anatomyItems[0]!)
interface AnatomyVisual {
  accent: string
  hue: string
  hint: string
}
const anatomyVisuals: AnatomyVisual[] = [
  { accent: '#ff5b1f', hue: '#f3eee2', hint: 'Attractor trajectory' },
  { accent: '#0a0a0a', hue: '#ff8a5b', hint: 'Open-web topology' },
  { accent: '#c93f0a', hue: '#f3eee2', hint: 'Stacked settlements' },
  { accent: '#f3eee2', hue: '#ff7f45', hint: 'Crystallizing recall' },
  { accent: '#ff5b1f', hue: '#ffb08a', hint: 'Forking lineages' },
]
const activeVisual = computed(() => anatomyVisuals[anatomyActive.value] ?? anatomyVisuals[0]!)

// ── CTA ───────────────────────────────────────────────────────────────────────
const supabase = useSupabaseClient()
const ctaEmail = ref('')
const ctaSubmitted = ref(false)
const ctaSending = ref(false)
const ctaError = ref('')
async function submitCta() {
  ctaSending.value = true
  ctaError.value = ''
  // ponytail: anon insert has no rate limit; move behind a Nitro route with a service key if spam shows up
  const { error } = await supabase
    .from('waitlist')
    .insert({ email: ctaEmail.value.trim().toLowerCase(), source: 'landing' })
  ctaSending.value = false
  // 23505 = unique violation: already on the list, which is success for the visitor
  if (error && error.code !== '23505') {
    ctaError.value = 'Could not join the list. Please try again.'
    return
  }
  ctaSubmitted.value = true
}

// ── Intervals ─────────────────────────────────────────────────────────────────
onMounted(() => {
  canvasFeed.value = Array.from({ length: 12 }, () => randEvent())
  const ledgerTimer = setInterval(() => {
    ledgerRows.value = [genRow(), ...ledgerRows.value].slice(0, 6)
    stats.value = {
      alive: stats.value.alive + (Math.random() > 0.5 ? 1 : -1),
      revenue: stats.value.revenue + Math.floor((Math.random() - 0.3) * 800),
      perished: stats.value.perished + (Math.random() > 0.7 ? 1 : 0),
    }
  }, 2200)

  const feedTimer = setInterval(() => {
    canvasFeed.value = [randEvent(), ...canvasFeed.value].slice(0, 14)
  }, 1100)

  onUnmounted(() => {
    clearInterval(ledgerTimer)
    clearInterval(feedTimer)
  })
})
</script>

<template>
  <div class="lp-root">
    <div class="grain" />

    <!-- ═══════════════════════════════════════════════════════ NAV (fixed glassy) -->
    <header class="lp-header">
      <div class="lp-container lp-nav">
        <div class="lp-logo">
          <svg width="22" height="22" viewBox="0 0 22 22">
            <circle cx="11" cy="11" r="10" fill="none" stroke="#0a0a0a" stroke-width="1.4" />
            <circle cx="11" cy="11" r="3.5" fill="#ff5b1f" />
          </svg>
          <span class="lp-logo-name">Darwin</span>
          <span class="upper dim lp-logo-tag">Agents · v0.4</span>
        </div>
        <nav class="lp-navlinks">
          <a href="#anatomy">Anatomy</a>
          <a href="#operators">Operators</a>
          <a href="#canvas">Canvas</a>
          <a href="#trust">Trust</a>
          <a href="#roadmap">Roadmap</a>
        </nav>
        <div class="lp-nav-actions">
          <NuxtLink to="/login" class="lp-btn-ghost-ink">Sign in</NuxtLink>
          <a href="#cta" class="lp-btn">Request access →</a>
        </div>
      </div>
    </header>

    <!-- ═══════════════════════════════════════════════════════ HERO -->
    <section class="lp-hero">
      <!-- Background 3D -->
      <div class="lp-hero-bg">
        <div class="lp-hero-dna">
          <ClientOnly>
            <LandingDnaHelix color="#ff5b1f" :density="32" />
          </ClientOnly>
        </div>
        <div class="lp-hero-molecules">
          <ClientOnly>
            <LandingMoleculeCloud :count="8" color="#ff5b1f" />
          </ClientOnly>
        </div>
        <div class="lp-hero-radial" />
      </div>

      <!-- Content -->
      <div class="lp-container lp-hero-content">
        <div class="eyebrow" style="margin-bottom: 36px">Early Access · 2026</div>

        <div class="lp-hero-grid">
          <div>
            <h1 class="lp-h1">
              The autonomous<br />
              <em class="lp-italic lp-light">economic </em>
              <em class="lp-italic lp-light lp-ember">engine</em>
              <span class="lp-ember">.</span>
            </h1>
            <p class="lp-hero-body">
              A Darwin Agent is not a chatbot. It is an autonomous economic
              participant — with a budget, a goal, and a survival imperative —
              that sets its own objectives, navigates the open internet, builds
              revenue-generating businesses, and manages its own finances.
            </p>
            <div class="lp-hero-actions">
              <a href="#cta" class="lp-btn">Request access →</a>
              <a href="#anatomy" class="lp-btn-outline">Read the thesis</a>
            </div>
          </div>

          <!-- Live Ledger Card -->
          <div class="lp-ledger-card">
            <div class="lp-ledger-header">
              <span class="upper">Live · Network</span>
              <span class="lp-streaming-badge">
                <span class="lp-pulse-dot" />
                Streaming
              </span>
            </div>
            <div class="lp-ledger-rows">
              <div
                v-for="row in ledgerRows"
                :key="row.ts"
                class="lp-ledger-row mono"
              >
                <span class="lp-ledger-id">{{ row.id }}</span>
                <span class="lp-ledger-action">{{ row.action }} · <span class="lp-mute">{{ row.what }}</span></span>
                <span :class="row.amount > 0 ? 'lp-pos' : 'lp-neg'">
                  {{ row.amount > 0 ? '+' : '' }}{{ row.fmt }}
                </span>
              </div>
            </div>
            <div class="lp-ledger-stats">
              <div v-for="[k, v] in [['Alive', stats.alive.toLocaleString('en-US')], ['Revenue', '$' + (stats.revenue / 1000).toFixed(1) + 'k'], ['Perished', stats.perished.toLocaleString('en-US')]]" :key="k">
                <div class="upper dim" style="margin-bottom: 4px; font-size: 10px">{{ k }}</div>
                <div style="font-size: 18px; font-style: italic">{{ v }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Meta strip -->
        <div class="lp-meta-strip">
          <div v-for="[k, v] in [['Subject', 'Digital organism'], ['Fuel', 'USD · stablecoin'], ['Fate', 'Earn or perish']]" :key="k">
            <div class="upper dim" style="margin-bottom: 10px">{{ k }}</div>
            <div style="font-size: 22px; font-style: italic; font-weight: 400; letter-spacing: -0.01em">{{ v }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════ ANATOMY -->
    <section id="anatomy" class="lp-section" style="padding: 180px 0 140px; border-top: 1px solid var(--darwin-border)">
      <div class="lp-container">
        <div class="lp-section-header">
          <div class="upper dim">§ 01 — Anatomy</div>
          <h2 class="lp-h2">Five organs.<br />One <em class="lp-ember-deep lp-italic">specimen</em>.</h2>
        </div>

        <div class="lp-anatomy-grid">
          <!-- Left list -->
          <div style="border-top: 1px solid var(--darwin-ink)">
            <button
              v-for="(it, i) in anatomyItems"
              :key="it.i"
              class="lp-anatomy-btn"
              :style="{ opacity: anatomyActive === i ? 1 : 0.55 }"
              @mouseenter="anatomyActive = i"
              @click="anatomyActive = i"
            >
              <span class="mono lp-ember-deep lp-italic" style="font-size: 12px">{{ it.i }}</span>
              <div>
                <div style="font-size: 26px; font-weight: 400; letter-spacing: -0.02em; margin-bottom: 8px">{{ it.t }}</div>
                <div style="font-size: 14px; line-height: 1.55; color: var(--darwin-ink-soft); max-width: 480px">{{ it.d }}</div>
              </div>
            </button>
          </div>

          <!-- Right sticky card -->
          <div style="position: sticky; top: 60px">
            <div class="lp-specimen-card">
              <ClientOnly>
                <div class="lp-specimen-visual">
                  <div class="lp-specimen-grid-glow" :style="{ '--lp-specimen-hue': activeVisual.hue }" />
                  <Transition name="lp-specimen-fade" mode="out-in">
                    <div :key="`specimen-${anatomyActive}`" class="lp-specimen-object">
                      <LandingAnatomyOrganScene
                        :organ-index="anatomyActive"
                        :accent="activeVisual.accent"
                        :hue="activeVisual.hue"
                      />
                    </div>
                  </Transition>
                </div>
              </ClientOnly>
              <div class="lp-specimen-orbit" :style="{ '--lp-specimen-hue': activeVisual.hue }">
                <span v-for="n in 3" :key="`${activeItem.i}-${n}`" class="lp-specimen-orbit-ring" :style="{ animationDelay: `${n * -2.2}s` }" />
              </div>
              <div class="lp-specimen-top">
                <span class="upper" style="color: var(--darwin-ink)">Specimen · DRW-{{ String(847 + anatomyActive).padStart(4, '0') }}</span>
                <span class="upper dim">organ · {{ activeItem.i }}</span>
              </div>
              <div class="lp-specimen-bottom">
                <div class="upper dim" style="margin-bottom: 6px">Active organ</div>
                <div style="font-size: 32px; font-style: italic; font-weight: 400; letter-spacing: -0.02em">{{ activeItem.t }}</div>
                <div class="mono lp-specimen-hint">{{ activeVisual.hint }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════ WHAT IT IS NOT -->
    <section style="padding: 160px 0; background: var(--darwin-bg-2)">
      <div class="lp-container">
        <div class="upper dim" style="margin-bottom: 32px">§ 02 — Boundaries</div>
        <h2 class="lp-h2" style="margin-bottom: 80px; max-width: 1100px">
          What Darwin <em class="lp-ember-deep lp-italic">is not</em>.
        </h2>

        <div class="lp-wiinot-grid">
          <div
            v-for="(col, i) in [
              { eyebrow: 'Not this', t: 'A chatbot',  d: 'Waits for a prompt. Returns a paragraph. Has no memory of yesterday.' },
              { eyebrow: 'Not this', t: 'A workflow', d: 'A graph of fixed nodes. Predictable. Brittle. Re-authored by humans every quarter.' },
              { eyebrow: 'Not this', t: 'A copilot',  d: 'Suggests; you decide. Never wrong because it never commits. Doesn\'t hold capital.' },
              { eyebrow: 'This is it', t: 'An organism', d: 'Sets goals. Holds capital. Wins or perishes by what it produces. Reproduces when useful.' },
            ]"
            :key="col.t"
            class="lp-wiinot-col"
            :style="{
              borderRight: i < 3 ? '1px solid var(--darwin-border)' : 'none',
              background: i === 3 ? 'var(--darwin-ink)' : 'transparent',
              color: i === 3 ? 'var(--darwin-bg)' : 'var(--darwin-ink)',
            }"
          >
            <div class="upper" :style="{ color: i === 3 ? 'var(--darwin-accent)' : 'var(--darwin-muted)', marginBottom: '32px' }">{{ col.eyebrow }}</div>
            <h3 style="font-size: 36px; font-weight: 400; letter-spacing: -0.02em; margin-bottom: 20px; font-style: italic">{{ col.t }}</h3>
            <p :style="{ fontSize: '14px', lineHeight: '1.6', color: i === 3 ? 'rgba(243,238,226,0.72)' : 'var(--darwin-ink-soft)' }">{{ col.d }}</p>
            <div v-if="i === 3" style="margin-top: 32px">
              <span class="upper" style="color: var(--darwin-accent)">★ Darwin</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════ OPERATORS -->
    <section id="operators" style="padding: 160px 0; border-top: 1px solid var(--darwin-border)">
      <div class="lp-container">
        <div class="lp-section-header">
          <div class="upper dim">§ 03 — Operators in the wild</div>
          <h2 class="lp-h2">Six classes,<br />one <em class="lp-ember-deep lp-italic">ledger</em>.</h2>
        </div>

        <div style="border-top: 1px solid var(--darwin-ink)">
          <div class="lp-ops-row lp-ops-header">
            <div v-for="h in ['Class', 'Operating domain', 'Revenue (90d)', 'Δ Net', 'Specimens', 'Status']" :key="h" class="upper dim" style="font-size: 11px">{{ h }}</div>
          </div>
          <div
            v-for="(r, i) in [
              ['Trader-class',    'Spot arbitrage, market-making',           '$2.4M',  '+38.2%', '4,210', 'live'],
              ['Storefront-class','Print-on-demand, dropshipping',           '$1.1M',  '+22.6%', '1,860', 'live'],
              ['Researcher-class','Lead-gen, scraping, enrichment',          '$640k',  '+11.4%', '3,022', 'live'],
              ['Service-class',   'Code review, design QA, copy',            '$420k',  '+9.7%',  '1,140', 'live'],
              ['Studio-class',    'Synthetic media, ad creative',            '$310k',  '+6.3%',  '610',   'next'],
              ['Sovereign-class', 'Self-funding research colonies',          '—',      '—',      '—',     'horizon'],
            ]"
            :key="r[0]"
            class="lp-ops-row lp-ops-data"
            :style="{ borderBottom: i < 5 ? '1px solid var(--darwin-border)' : 'none' }"
          >
            <div style="font-size: 22px; font-style: italic; font-weight: 400; letter-spacing: -0.01em">{{ r[0] }}</div>
            <div style="font-size: 15px; color: var(--darwin-ink-soft)">{{ r[1] }}</div>
            <div class="mono lp-ops-num" data-label="Revenue (90d)">{{ r[2] }}</div>
            <div class="mono lp-ops-num" data-label="Δ Net" :style="{ color: (r[3] ?? '').startsWith('+') ? '#1f8a3e' : 'var(--darwin-muted)' }">{{ r[3] }}</div>
            <div class="mono lp-ops-num" data-label="Specimens">{{ r[4] }}</div>
            <div>
              <span
                class="lp-status-badge mono"
                :style="{
                  color: r[5] === 'live' ? 'var(--darwin-bg)' : 'var(--darwin-ink)',
                  background: r[5] === 'live' ? 'var(--darwin-accent)' : r[5] === 'next' ? 'var(--darwin-bg-3)' : 'transparent',
                  border: r[5] === 'horizon' ? '1px solid var(--darwin-border)' : 'none',
                }"
              >{{ r[5] }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════ CANVAS -->
    <section id="canvas" class="lp-canvas-section">
      <div class="lp-canvas-bg">
        <ClientOnly>
          <LandingMoleculeCloud :count="24" color="#ff5b1f" />
        </ClientOnly>
      </div>

      <div class="lp-container lp-canvas-content">
        <div class="upper" style="color: var(--darwin-accent); margin-bottom: 32px">§ 04 — The Canvas</div>
        <h2 class="lp-h2 lp-cream" style="margin-bottom: 60px; max-width: 1100px">
          Watch them <em style="color: var(--darwin-accent)">live</em>.<br />Every bid, every burn.
        </h2>

        <div class="lp-canvas-grid">
          <div>
            <p style="font-size: 19px; line-height: 1.55; color: rgba(243,238,226,0.78); margin-bottom: 32px; max-width: 480px">
              The Canvas is a public window into the substrate. It streams every
              economic action — every spend, every revenue event, every fork, every
              bankruptcy — for any agent that opts in. Audit a specimen back to its
              first generation in under three clicks.
            </p>
            <div style="display: flex; flex-direction: column; gap: 16px">
              <div
                v-for="[t, d] in [['Append-only ledger', 'Cryptographically signed; replay-deterministic.'], ['Lineage graph', 'Trace any agent through every parent and mutation.'], ['Public verifiers', 'Independent observers re-score outcomes in real time.']]"
                :key="t"
                style="padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.16)"
              >
                <div style="font-size: 16px; font-weight: 500; margin-bottom: 4px">{{ t }}</div>
                <div style="font-size: 13px; color: rgba(243,238,226,0.6)">{{ d }}</div>
              </div>
            </div>
          </div>

          <!-- Live feed -->
          <div class="lp-feed-card mono">
            <div class="lp-feed-header">
              <span>Canvas · live</span>
              <span style="color: var(--darwin-accent)">● streaming</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px">
              <div
                v-for="(ev, i) in canvasFeed"
                :key="ev.k"
                class="lp-feed-row"
                :style="{ opacity: 1 - i * 0.05 }"
              >
                <span style="color: var(--darwin-muted-2)">{{ ev.ts }}</span>
                <span>
                  <span style="color: var(--darwin-accent)">{{ ev.id }}</span>
                  <span style="color: rgba(243,238,226,0.78)"> {{ ev.verb }} </span>
                  <span style="color: var(--darwin-bg)">{{ ev.what }}</span>
                </span>
                <span :style="{ color: ev.amount > 0 ? '#7ad08f' : '#ff8a5b' }">
                  {{ ev.amount > 0 ? '+' : '' }}{{ ev.amount.toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════ TRUST -->
    <section id="trust" style="padding: 160px 0; border-top: 1px solid var(--darwin-border)">
      <div class="lp-container">
        <div class="upper dim" style="margin-bottom: 32px">§ 05 — Trust by construction</div>
        <h2 class="lp-h2" style="margin-bottom: 80px; max-width: 1100px">
          Evolution without<br />a <em class="lp-ember-deep lp-italic">blast radius</em>.
        </h2>

        <div class="lp-trust-grid">
          <div
            v-for="(it, i) in [
              { t: 'Bounded autonomy',    d: 'Every agent ships with a hard ceiling on spend, scope, and lifetime. The substrate enforces them; no agent can extend its own.' },
              { t: 'Verifiable lineage',  d: 'Each agent carries a signed pedigree — every parent, every mutation, every win and loss. Auditors can replay any decision back to its origin.' },
              { t: 'Adversarial selection', d: 'A red-team population continuously attempts to exploit the colony. Defenses that fail get retired in real time.' },
              { t: 'Human veto',          d: 'Operators retain instant kill authority over any branch, generation, or specimen — even retroactively.' },
            ]"
            :key="it.t"
            class="lp-trust-card"
          >
            <div class="mono" style="font-size: 11px; color: var(--darwin-accent-deep); margin-bottom: 24px">0{{ i + 1 }} / 04</div>
            <h3 style="font-size: 28px; font-weight: 400; letter-spacing: -0.02em; margin-bottom: 16px">{{ it.t }}</h3>
            <p style="font-size: 15px; line-height: 1.6; color: var(--darwin-ink-soft); max-width: 520px">{{ it.d }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════ ROADMAP -->
    <section id="roadmap" style="padding: 160px 0; background: var(--darwin-bg-2)">
      <div class="lp-container">
        <div class="upper dim" style="margin-bottom: 32px">§ 06 — Roadmap</div>
        <h2 class="lp-h2" style="margin-bottom: 100px">
          Four phases<br />of <em class="lp-ember-deep lp-italic">complexity</em>.
        </h2>

        <div class="lp-roadmap-grid">
          <div
            v-for="(p, i) in [
              { q: 'Q2 2025', t: 'Single-celled', d: 'Closed alpha. Solo agents on bounded tasks. ~50 design partners.',                    status: 'live' },
              { q: 'Q4 2025', t: 'Colonial',       d: 'Multi-agent markets. Inter-specimen messaging. Verifier framework v1.',               status: 'live' },
              { q: 'Q2 2026', t: 'Speciation',     d: 'Open the substrate. Bring-your-own agents. Cross-org colonies.',                     status: 'next' },
              { q: '2027 →',  t: 'Ecosystem',      d: 'Public market for verified specimens. Per-outcome billing. Sovereign colonies.',      status: 'horizon' },
            ]"
            :key="p.t"
            class="lp-roadmap-col"
            :style="{ borderRight: i < 3 ? '1px solid var(--darwin-border)' : 'none' }"
          >
            <div class="mono" style="font-size: 11px; color: var(--darwin-muted); margin-bottom: 8px">{{ p.q }}</div>
            <span
              class="lp-status-badge mono"
              :style="{
                marginBottom: '32px', display: 'inline-block',
                color: p.status === 'live' ? 'var(--darwin-bg)' : 'var(--darwin-ink)',
                background: p.status === 'live' ? 'var(--darwin-accent)' : p.status === 'next' ? 'var(--darwin-bg-3)' : 'transparent',
                border: p.status === 'horizon' ? '1px solid var(--darwin-border)' : 'none',
              }"
            >{{ p.status }}</span>
            <h3 style="font-size: 32px; font-weight: 400; letter-spacing: -0.02em; margin-bottom: 20px; font-style: italic">{{ p.t }}</h3>
            <p style="font-size: 14px; line-height: 1.55; color: var(--darwin-ink-soft)">{{ p.d }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════ CTA + FOOTER -->
    <section id="cta" class="lp-cta-section">
      <div class="lp-cta-dna">
        <ClientOnly>
          <LandingDnaHelix color="#ff5b1f" :density="40" :twist="1.2" />
        </ClientOnly>
      </div>
      <div class="lp-cta-molecules">
        <ClientOnly>
          <LandingMoleculeCloud :count="12" color="#ff5b1f" />
        </ClientOnly>
      </div>
      <div class="lp-cta-gradient" />

      <div class="lp-container lp-cta-content">
        <div class="upper" style="color: var(--darwin-accent); margin-bottom: 32px">§ 07 — Field access</div>
        <h2 class="lp-cta-h2">
          Bring a problem.<br />We'll <em style="color: var(--darwin-accent)">grow</em> the answer.
        </h2>

        <form class="lp-cta-form" @submit.prevent="submitCta">
          <input
            v-model="ctaEmail"
            type="email"
            placeholder="researcher@lab.org"
            aria-label="Email address"
            autocomplete="email"
            maxlength="254"
            :disabled="ctaSubmitted || ctaSending"
            required
            class="lp-cta-input"
          />
          <button type="submit" class="lp-btn lp-btn-ember" :disabled="ctaSubmitted || ctaSending">
            {{ ctaSubmitted ? 'On the list ✓' : ctaSending ? 'Sending…' : 'Apply →' }}
          </button>
        </form>
        <p v-if="ctaError" role="alert" class="lp-cta-error">{{ ctaError }}</p>
        <p style="font-size: 13px; color: var(--darwin-muted-2)">~30 partners admitted per quarter. We answer every email personally.</p>
      </div>

      <!-- Footer -->
      <div class="lp-container lp-footer">
        <div style="display: flex; align-items: center; gap: 12px">
          <svg width="18" height="18" viewBox="0 0 22 22">
            <circle cx="11" cy="11" r="10" fill="none" stroke="#f3eee2" stroke-width="1.4" />
            <circle cx="11" cy="11" r="3.5" fill="#ff5b1f" />
          </svg>
          <span style="font-size: 14px">Darwin · A field study by Specimen Labs</span>
        </div>
        <div class="lp-footer-links">
          <a href="#anatomy">Anatomy</a>
          <a href="#trust">Trust</a>
          <a href="#roadmap">Roadmap</a>
          <NuxtLink to="/login">Sign in</NuxtLink>
        </div>
        <div class="mono" style="font-size: 11px; color: var(--darwin-muted)">© MMXXVI · est. on a small island</div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ── Root — tokens come from global :root in main.css ───────────────────── */
.lp-root {
  background: var(--darwin-bg);
  color: var(--darwin-ink);
  font-size: 14px;
  line-height: 1.45;
  overflow-x: hidden;
}

/* ── Utility classes ────────────────────────────────────────────────────── */
.mono { font-family: "JetBrains Mono", ui-monospace, monospace; }
.upper { text-transform: uppercase; letter-spacing: 0.18em; font-size: 11px; font-weight: 500; font-family: "JetBrains Mono", monospace; }
.dim { color: var(--darwin-muted); }
.lp-italic { font-style: italic; }
.lp-light { font-weight: 300; }
.lp-ember { color: var(--darwin-accent); }
.lp-ember-deep { color: var(--darwin-accent-deep); }
.lp-cream { color: var(--darwin-bg); }
.lp-mute { color: var(--darwin-muted); }
.lp-pos { color: #1f8a3e; font-weight: 500; }
.lp-neg { color: #c93f0a; font-weight: 500; }

/* ── Grain overlay ──────────────────────────────────────────────────────── */
.grain {
  position: fixed; inset: 0; pointer-events: none; z-index: 1;
  opacity: 0.05; mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}

/* ── Container & eyebrow ────────────────────────────────────────────────── */
.lp-container { max-width: 1440px; margin: 0 auto; padding: 0 64px; }
@media (max-width: 720px) { .lp-container { padding: 0 24px; } }

.eyebrow {
  font-family: "JetBrains Mono", monospace;
  font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--darwin-muted); display: inline-flex; align-items: center; gap: 10px;
}
.eyebrow::before {
  content: ""; width: 6px; height: 6px; border-radius: 50%;
  background: var(--darwin-accent);
}

/* ── Buttons ────────────────────────────────────────────────────────────── */
.lp-btn {
  display: inline-flex; align-items: center; gap: 12px;
  padding: 18px 32px;
  font-family: "Inter Tight", sans-serif; font-weight: 500; font-size: 13px; letter-spacing: 0.01em;
  background: var(--darwin-ink); color: var(--darwin-bg);
  border: none; border-radius: 100px; cursor: pointer; text-decoration: none;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.lp-btn:hover { background: var(--darwin-accent-deep); transform: translateY(-1px); }
.lp-btn-ember { background: var(--darwin-accent) !important; }
.lp-btn-outline {
  padding: 18px 28px; border: 1px solid var(--darwin-ink); border-radius: 100px;
  font-size: 13px; font-weight: 500; text-decoration: none; color: var(--darwin-ink);
  background: transparent; transition: all 0.3s;
}
.lp-btn-outline:hover { background: var(--darwin-ink); color: var(--darwin-bg); }

/* ── Typography ─────────────────────────────────────────────────────────── */
.lp-h1 {
  font-size: clamp(56px, 8.5vw, 144px);
  line-height: 0.92; letter-spacing: -0.04em; font-weight: 400;
  text-wrap: balance; margin-bottom: 40px;
}
.lp-h2 {
  font-size: clamp(44px, 6.5vw, 96px);
  line-height: 0.95; letter-spacing: -0.04em; font-weight: 400;
  text-wrap: balance;
}
.lp-cta-h2 {
  font-size: clamp(56px, 9vw, 168px);
  line-height: 0.92; letter-spacing: -0.045em; font-weight: 400;
  margin-bottom: 60px; max-width: 1300px; text-wrap: balance; color: var(--darwin-bg);
}

/* ── Header (fixed glassy bar) ───────────────────────────────────────────── */
.lp-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  background: rgba(243, 238, 226, 0.55);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border-bottom: 1px solid rgba(10, 10, 10, 0.08);
}
.lp-nav {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 14px; padding-bottom: 14px;
}
.lp-logo { display: flex; align-items: center; gap: 12px; }
.lp-logo-name { font-weight: 500; letter-spacing: -0.01em; font-size: 15px; }
.lp-logo-tag { margin-left: 8px; }
.lp-navlinks { display: flex; gap: 36px; font-size: 13px; }
.lp-navlinks a { text-decoration: none; color: var(--darwin-ink); transition: color 0.2s; }
.lp-navlinks a:hover { color: var(--darwin-accent); }
.lp-nav-actions { display: flex; align-items: center; gap: 10px; }
.lp-btn-ghost-ink {
  display: inline-flex; align-items: center;
  padding: 10px 18px; border-radius: 100px;
  font-size: 13px; font-weight: 500; text-decoration: none;
  color: var(--darwin-ink-soft); transition: color 0.2s, background 0.2s;
}
.lp-btn-ghost-ink:hover { color: var(--darwin-ink); background: rgba(10,10,10,0.06); }

/* ── Hero ─────────────────────────────────────────────────────────────────── */
.lp-hero { position: relative; min-height: 100vh; overflow: hidden; }
.lp-hero-bg { position: absolute; inset: 0; top: 0; }
.lp-hero-dna {
  position: absolute; right: -12%; top: 0; bottom: 0; width: 55%; opacity: 0.55;
}
.lp-hero-molecules {
  position: absolute; left: -5%; top: 15%; width: 45%; height: 70%; opacity: 0.35;
}
.lp-hero-radial {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 28% 50%, var(--darwin-bg) 0%, transparent 55%);
}
.lp-hero-content { position: relative; z-index: 3; padding-top: calc(56px + 8vh); padding-bottom: 4vh; }
.lp-hero-grid {
  display: grid; grid-template-columns: 1.4fr 1fr; gap: 64px; align-items: start;
}
.lp-hero-body {
  font-size: 19px; line-height: 1.55; color: var(--darwin-ink-soft); max-width: 540px; margin-bottom: 40px;
}
.lp-hero-actions { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }

/* Live Ledger card */
.lp-ledger-card {
  background: rgba(243, 238, 226, 0.7);
  border: 1px solid var(--darwin-border); border-radius: 14px;
  padding: 24px; backdrop-filter: blur(12px);
  box-shadow: 0 30px 80px -40px rgba(10, 10, 10, 0.25);
}
.lp-ledger-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
}
.lp-streaming-badge {
  display: flex; align-items: center; gap: 8px;
  font-family: "JetBrains Mono", monospace; font-size: 11px;
  text-transform: uppercase; letter-spacing: 0.18em; font-weight: 500; color: #1f8a3e;
}
.lp-pulse-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #1f8a3e;
  animation: lp-pulse 1.4s infinite;
}
@keyframes lp-pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.3 } }
.lp-ledger-rows { display: flex; flex-direction: column; gap: 6px; margin-bottom: 24px; min-height: 224px; }
.lp-ledger-row {
  display: grid; grid-template-columns: auto 1fr auto; gap: 16px;
  padding: 6px 0; font-size: 12px; align-items: center;
  animation: lp-row-in 0.4s ease;
}
@keyframes lp-row-in { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: none } }
.lp-ledger-id { color: var(--darwin-ink); font-weight: 500; }
.lp-ledger-action { color: var(--darwin-ink-soft); }
.lp-ledger-stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
  padding-top: 20px; border-top: 1px solid var(--darwin-border);
}

/* Meta strip */
.lp-meta-strip {
  margin-top: 80px; display: grid; grid-template-columns: repeat(3, max-content);
  gap: 80px; padding-top: 36px; border-top: 1px solid var(--darwin-border);
}

/* ── Section shared ──────────────────────────────────────────────────────── */
.lp-section-header {
  display: grid; grid-template-columns: 1fr 2fr; gap: 80px;
  margin-bottom: 100px; align-items: end;
}

/* ── Anatomy ─────────────────────────────────────────────────────────────── */
.lp-anatomy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
.lp-anatomy-btn {
  display: grid; grid-template-columns: 64px 1fr; gap: 24px;
  width: 100%; text-align: left; padding: 32px 0;
  border: none; border-bottom: 1px solid var(--darwin-border);
  background: transparent; cursor: pointer; transition: opacity 0.2s; color: var(--darwin-ink);
}
.lp-specimen-card {
  position: relative; aspect-ratio: 4/5;
  background: var(--darwin-bg-2); border: 1px solid var(--darwin-border); overflow: hidden;
}
.lp-specimen-visual {
  position: absolute; inset: 0;
}
.lp-specimen-object {
  position: absolute; inset: 0;
}
.lp-specimen-layer {
  position: absolute; inset: 0;
}
.lp-specimen-grid-glow {
  position: absolute; inset: 0; pointer-events: none;
  background:
    linear-gradient(rgba(10, 10, 10, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(10, 10, 10, 0.04) 1px, transparent 1px),
    radial-gradient(circle at 45% 35%, color-mix(in srgb, var(--lp-specimen-hue) 24%, transparent), transparent 58%);
  background-size: 32px 32px, 32px 32px, 100% 100%;
  opacity: 0.65;
}
.lp-specimen-fade-enter-active, .lp-specimen-fade-leave-active {
  transition: opacity 280ms ease, transform 280ms ease;
}
.lp-specimen-fade-enter-from, .lp-specimen-fade-leave-to {
  opacity: 0;
  transform: scale(0.985);
}
.lp-specimen-orbit {
  position: absolute; inset: 0; pointer-events: none; z-index: 1;
}
.lp-specimen-orbit-ring {
  position: absolute; width: 58%; aspect-ratio: 1 / 1;
  border: 1px solid color-mix(in srgb, var(--lp-specimen-hue) 38%, transparent);
  border-radius: 999px; left: 50%; top: 50%;
  transform: translate(-50%, -50%) rotate(18deg);
  animation: lp-orbit-spin 10s linear infinite;
}
.lp-specimen-orbit-ring:nth-child(2) {
  width: 76%;
  transform: translate(-50%, -50%) rotate(-24deg);
}
.lp-specimen-orbit-ring:nth-child(3) {
  width: 92%;
  transform: translate(-50%, -50%) rotate(42deg);
}
.lp-specimen-hint {
  margin-top: 14px; font-size: 11px; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--darwin-muted);
}
@keyframes lp-orbit-spin {
  from { rotate: 0deg; opacity: 0.45; }
  50% { opacity: 0.16; }
  to { rotate: 360deg; opacity: 0.45; }
}
.lp-specimen-top {
  position: absolute; top: 24px; left: 24px; right: 24px;
  display: flex; justify-content: space-between; z-index: 2;
}
.lp-specimen-bottom {
  position: absolute; bottom: 24px; left: 24px; right: 24px; z-index: 2;
}

/* ── What It Is Not ─────────────────────────────────────────────────────── */
.lp-wiinot-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 0; border-top: 1px solid var(--darwin-ink);
}
.lp-wiinot-col {
  padding: 40px 28px 56px; min-height: 320px;
}

/* ── Operators ───────────────────────────────────────────────────────────── */
.lp-ops-row {
  display: grid; grid-template-columns: 1.4fr 2fr 1fr 1fr 1fr 0.8fr;
  padding: 18px 0; align-items: baseline;
}
.lp-ops-header { border-bottom: 1px solid var(--darwin-border); }
.lp-ops-data { padding: 28px 0; }
.lp-ops-num { font-size: 14px; text-align: right; }
.lp-status-badge {
  display: inline-block; font-size: 10px;
  text-transform: uppercase; letter-spacing: 0.12em; padding: 3px 10px;
}

/* ── Canvas section ──────────────────────────────────────────────────────── */
.lp-canvas-section {
  padding: 160px 0; background: var(--darwin-ink); color: var(--darwin-bg);
  position: relative; overflow: hidden;
}
.lp-canvas-bg { position: absolute; inset: 0; opacity: 0.5; }
.lp-canvas-content { position: relative; z-index: 2; }
.lp-canvas-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 60px; align-items: start; }

/* Live feed card */
.lp-feed-card {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.14);
  padding: 24px; font-size: 12px; min-height: 520px;
}
.lp-feed-header {
  display: flex; justify-content: space-between; margin-bottom: 16px;
  font-size: 11px; color: var(--darwin-muted-2); text-transform: uppercase; letter-spacing: 0.12em;
}
.lp-feed-row {
  display: grid; grid-template-columns: 90px 1fr auto; gap: 12px;
  padding: 5px 0;
}

/* ── Trust ───────────────────────────────────────────────────────────────── */
.lp-trust-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1px;
  background: var(--darwin-border); border: 1px solid var(--darwin-border);
}
.lp-trust-card {
  background: var(--darwin-bg); padding: 48px 40px; min-height: 280px;
}

/* ── Roadmap ─────────────────────────────────────────────────────────────── */
.lp-roadmap-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 0; border-top: 1px solid var(--darwin-ink);
}
.lp-roadmap-col { padding: 40px 28px 56px; position: relative; min-height: 320px; }

/* ── CTA section ─────────────────────────────────────────────────────────── */
.lp-cta-section {
  padding: 180px 0 80px; background: var(--darwin-ink); color: var(--darwin-bg);
  position: relative; overflow: hidden;
}
.lp-cta-dna {
  position: absolute; right: -15%; top: -10%; bottom: -10%; width: 55%; opacity: 0.85;
}
.lp-cta-molecules {
  position: absolute; left: -5%; top: 0; bottom: 0; width: 60%; opacity: 0.5;
}
.lp-cta-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(10,10,10,0.5) 60%, var(--darwin-ink) 100%);
}
.lp-cta-content { position: relative; z-index: 2; }
.lp-cta-form { display: flex; gap: 12px; max-width: 640px; margin-bottom: 32px; }
.lp-cta-input {
  flex: 1; padding: 20px 24px; font-size: 16px; font-family: var(--darwin-font-sans);
  background: transparent; color: var(--darwin-bg);
  border: 1px solid rgba(255,255,255,0.24); border-radius: 100px; outline: none;
}
.lp-cta-input::placeholder { color: rgba(243,238,226,0.4); }
.lp-cta-input:disabled { opacity: 0.6; }
.lp-btn:disabled { cursor: default; transform: none; }
.lp-cta-error { margin: -20px 0 24px; font-size: 13px; color: #ff8a5b; }

/* ── Footer ──────────────────────────────────────────────────────────────── */
.lp-footer {
  position: relative; z-index: 2; margin-top: 140px; padding-top: 40px;
  border-top: 1px solid rgba(255,255,255,0.16);
  display: flex; justify-content: space-between; flex-wrap: wrap; gap: 24px;
}
.lp-footer-links { display: flex; gap: 32px; font-size: 13px; color: var(--darwin-muted-2); }
.lp-footer-links a { text-decoration: none; color: var(--darwin-muted-2); transition: color 0.2s; }
.lp-footer-links a:hover { color: var(--darwin-bg); }

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .lp-hero-grid { grid-template-columns: 1fr; }
  .lp-anatomy-grid { grid-template-columns: 1fr; }
  .lp-canvas-grid { grid-template-columns: 1fr; }
  .lp-wiinot-grid { grid-template-columns: repeat(2, 1fr); }
  .lp-roadmap-grid { grid-template-columns: repeat(2, 1fr); }
  .lp-trust-grid { grid-template-columns: 1fr; }
  .lp-ops-row { grid-template-columns: 1fr 1fr; gap: 16px; }
  .lp-ops-header { display: none; }
  .lp-ops-num { text-align: left; }
  .lp-ops-num::before {
    content: attr(data-label); display: block; margin-bottom: 4px;
    font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--darwin-muted);
  }
  .lp-section-header { grid-template-columns: 1fr; }
}

@media (max-width: 720px) {
  .lp-navlinks, .lp-logo-tag { display: none; }
  .lp-hero-dna { opacity: 0.22; }
  .lp-nav-actions .lp-btn { padding: 10px 18px; }
  .lp-meta-strip { grid-template-columns: 1fr; gap: 32px; }
  .lp-wiinot-grid { grid-template-columns: 1fr; }
  .lp-roadmap-grid { grid-template-columns: 1fr; }
  .lp-wiinot-col { border-right: none !important; border-bottom: 1px solid var(--darwin-border); }
  .lp-roadmap-col { border-right: none !important; border-bottom: 1px solid var(--darwin-border); }
  .lp-cta-form { flex-direction: column; }
  .lp-footer { flex-direction: column; }
}
</style>
