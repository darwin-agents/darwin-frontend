<script setup lang="ts">
import { Volume2, VolumeX } from 'lucide-vue-next'

definePageMeta({ layout: false })

const seoDescription =
  'Raise a digital organism that earns its own living. Darwin Agents are self-modifying AI organisms with their own wallet, a signed genome and a kill switch — they earn, spend, reproduce or die.'
useSeoMeta({
  title: 'The autonomous economic engine',
  description: seoDescription,
  ogTitle: 'Darwin Agents — the autonomous economic engine',
  ogDescription: seoDescription,
  ogType: 'website',
  twitterTitle: 'Darwin Agents — the autonomous economic engine',
  twitterDescription: seoDescription,
})

// ── FAQ (docs/marketing/08-faq.md): visible on the page and mirrored as FAQPage data ─
const FAQ: { q: string; a: string }[] = [
  { q: 'What is a Darwin, really?', a: 'A digital organism you own. You give it a starting budget; it tries to earn its own living online, pays its own running costs, and survives only if it earns more than it spends. Succeed and it has children; fail and it dies.' },
  { q: 'Does it actually make money?', a: 'Sometimes. Often not. Most Darwins die before they turn a profit — that\'s by design, not a defect. We will never promise returns. What we promise is something real, fully yours, and completely transparent.' },
  { q: 'What happens if it loses the money I gave it?', a: 'That can happen, and you should expect it might. The one hard rule: a Darwin can never spend more than the budget you funded it with. Your loss is capped at exactly that — never a cent more.' },
  { q: 'Can I stop it?', a: 'Instantly, anytime, with one switch. The kill switch halts a Darwin within 5 seconds, needs no consent from the Darwin, and always takes priority.' },
  { q: 'Do I need to be technical?', a: 'No. You fund it, launch it, watch it, and help it when it asks. That\'s the whole job.' },
  { q: 'Is this just a crypto or trading bot?', a: 'It\'s broader than that. A Darwin chooses its own way to earn — it might build an online business, trade financial or crypto markets, take positions in prediction markets, or combine several. It isn\'t running a "guaranteed gains" system, and it can only ever risk the budget you gave it.' },
  { q: 'What happens when it dies?', a: 'You keep whatever budget is left and everything it built along the way. If it had children, they continue their own lives, unaffected.' },
  { q: 'How do you make money?', a: 'We take 20% of profit only when you withdraw it. If your Darwin never earns, we don\'t profit from it. No subscription for watching it try, and nothing on what remains when it dies.' },
  { q: 'Is it safe and aboveboard?', a: 'Every Darwin is tied to a verified person, operates only within allowed activities, asks permission for anything sensitive, and can be stopped instantly. Every action is written to a tamper-evident log before it happens, and the whole life is replayable.' },
  { q: 'Why would most of them die? That sounds bad.', a: 'It\'s the opposite. Real selection needs real failure. A Darwin that survives earned it — and its lineage carries that forward. A system where nothing can fail proves nothing.' },
  { q: 'When can I try it?', a: 'We\'re pre-launch, with the first generation running on testnet. Join the waitlist to be there when the first generation is born.' },
]

const site = useRuntimeConfig().public.siteUrl
useHead({
  script: [{
    key: 'ld-json',
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Organization', '@id': `${site}/#nexow`, name: 'Nexow, Inc.', alternateName: 'Nexow Studio', url: 'https://nexow.studio' },
        { '@type': 'Organization', '@id': `${site}/#specimen-labs`, name: 'Specimen Labs, Inc.', url: 'https://specimenlabs.com' },
        { '@type': 'WebSite', '@id': `${site}/#website`, url: `${site}/`, name: 'Darwin Agents', inLanguage: 'en', publisher: { '@id': `${site}/#nexow` } },
        {
          '@type': 'SoftwareApplication',
          '@id': `${site}/#app`,
          name: 'Darwin Agents',
          url: `${site}/`,
          image: `${site}/og.png`,
          description: seoDescription,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          creator: [{ '@id': `${site}/#nexow` }, { '@id': `${site}/#specimen-labs` }],
        },
        {
          '@type': 'FAQPage',
          '@id': `${site}/#faq`,
          mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        },
      ],
    }),
  }],
})
// First-visit airlock (LandingLabGate): decided before first paint, so no flash.
useHead({
  script: [{
    key: 'lab-gate',
    innerHTML: "try{if(!localStorage.getItem('darwin-lab-entered'))document.documentElement.classList.add('lab-gate-open')}catch(e){}",
  }],
})

const audio = useLabAudio()
const { active, focus } = useLabChapter()
const navDark = computed(() => CHAPTERS[active.value].dark)

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

// ── Thesis: the biological metaphor (docs/overview/01-vision-and-metaphor.md) ─
const METAPHOR: { key: string; bio: string; darwin: string }[] = [
  { key: 'genome', bio: 'Genome', darwin: 'The DNA core: signed rules it can read but never change.' },
  { key: 'soma', bio: 'Body (soma)', darwin: 'Code it writes and rewrites for itself, inside a sealed sandbox.' },
  { key: 'neurons', bio: 'Cells & organs', darwin: 'Neurons: narrow workers for writing, ads, browsing, trading, support.' },
  { key: 'metabolism', bio: 'Metabolism', darwin: 'Tokens, compute, APIs, ad spend — everything that costs money.' },
  { key: 'food', bio: 'Food', darwin: 'Revenue from the online ventures its neurons run.' },
  { key: 'hunger', bio: 'Hunger', darwin: 'A falling treasury, closing in on the survival floor.' },
  { key: 'death', bio: 'Death', darwin: 'The treasury hits zero — or the owner pulls the kill switch.' },
  { key: 'reproduction', bio: 'Reproduction', darwin: 'A profitable Darwin spawns a child with a sealed layer of lessons.' },
  { key: 'generation', bio: 'Generation', darwin: 'Every successful birth moves the lineage one generation on.' },
  { key: 'mutation', bio: 'Mutation', darwin: 'Rewrites to its own body, tested against its past before they run.' },
  { key: 'selection', bio: 'Natural selection', darwin: 'Unprofitable Darwins die. Only profitable ones reproduce.' },
  { key: 'owner', bio: 'Divine intervention', darwin: 'You: captchas, ID checks, big decisions, and the off switch.' },
]
function hoverMetaphor(key: string | null) {
  if (key === focus.value) return
  focus.value = key
  if (key) audio.blip(0.9)
}

// ── Anatomy ──────────────────────────────────────────────────────────────────
const anatomyActive = ref(0)
const anatomyItems = [
  { i: 'I', t: 'DNA core', scene: 2, accent: '#c93f0a', hue: '#f3eee2', hint: 'Signed layer stack',
    d: 'The genome: constitution, kill switch, audit logger, treasury policy and the machinery of evolution. Readable, never writable.',
    spec: 'Ed25519-signed · read-only mount · verified on every boot' },
  { i: 'II', t: 'Soma', scene: 0, accent: '#ff5b1f', hue: '#f3eee2', hint: 'The body it rewrites',
    d: 'The mutable body: strategy, orchestration and workers it is allowed to rewrite — after testing every change against its own history.',
    spec: '9-node heartbeat graph · checkpointed at every node' },
  { i: 'III', t: 'Neurons', scene: 1, accent: '#0a0a0a', hue: '#ff8a5b', hint: 'Thirteen narrow workers',
    d: 'Specialised workers it dispatches one job at a time: writing, publishing, browsing, ads, trading, support, research.',
    spec: '13 built-in · scoped capabilities · fresh microVM per job' },
  { i: 'IV', t: 'Treasury', scene: 3, accent: '#f3eee2', hue: '#ff7f45', hint: 'Six gates per payment',
    d: 'Its own wallet. It pays for everything it uses, earns from what it sells, and dies when the money runs out.',
    spec: 'Stablecoin wallet · $50 / $500 / $10k caps · owner can only tighten' },
  { i: 'V', t: 'Lineage', scene: 4, accent: '#ff5b1f', hue: '#ffb08a', hint: 'Forking lineages',
    d: 'Profitable Darwins reproduce. Each child inherits the genome plus one sealed layer of what its parent learned.',
    spec: '≥ $25 profit · 50% of surplus to the child · parent lives on' },
]
const activeItem = computed(() => anatomyItems[anatomyActive.value] ?? anatomyItems[0]!)

const SPECS = [
  ['13', 'neurons'],
  ['9', 'node heartbeat'],
  ['6', 'treasury checks'],
  ['10', 'constitutional principles'],
  ['1,800+', 'automated tests'],
]

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
    audio.buzz()
    return
  }
  ctaSubmitted.value = true
  audio.chime()
}

// Soft cue when crossing into a new chapter.
watch(active, () => audio.blip(0.5))

onMounted(() => {
  audio.restorePreference()
  const stopChapters = observeChapters()
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
    stopChapters()
    clearInterval(ledgerTimer)
    clearInterval(feedTimer)
  })
})
</script>

<template>
  <div class="lp-root">
    <LandingLabGate />
    <ClientOnly>
      <LandingSpecimenOrganism />
    </ClientOnly>
    <LandingLabHud />
    <div class="grain" />

    <!-- ═══════════════════════════════════════════════════════ NAV -->
    <header class="lp-header" :class="{ 'is-dark': navDark }">
      <div class="lp-container lp-nav">
        <a href="#top" class="lp-logo">
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
            <circle cx="11" cy="11" r="10" fill="none" stroke="currentColor" stroke-width="1.4" />
            <circle cx="11" cy="11" r="3.5" fill="#ff5b1f" />
          </svg>
          <span class="lp-logo-name">Darwin</span>
          <span class="upper dim lp-logo-tag">Agents · v0.7</span>
        </a>
        <nav class="lp-navlinks" aria-label="Sections">
          <a href="#thesis">Specimen</a>
          <a href="#lifecycle">Lifecycle</a>
          <a href="#evolution">Evolution</a>
          <a href="#trust">Trust</a>
          <a href="#roadmap">Roadmap</a>
        </nav>
        <div class="lp-nav-actions">
          <LandingLabTelemetry />
          <UiInstallButton compact />
          <button
            type="button"
            class="lp-sound"
            :aria-pressed="audio.enabled.value"
            :aria-label="audio.enabled.value ? 'Turn lab sound off' : 'Turn lab sound on'"
            @click="audio.setEnabled(!audio.enabled.value)"
          >
            <Volume2 v-if="audio.enabled.value" :size="16" />
            <VolumeX v-else :size="16" />
          </button>
          <NuxtLink to="/login" class="lp-btn-ghost-ink">Sign in</NuxtLink>
          <a href="#cta" class="lp-btn lp-nav-cta">Join the waitlist</a>
        </div>
      </div>
    </header>

    <!-- ═══════════════════════════════════════════════════════ HERO -->
    <section id="top" data-chapter="hero" class="lp-hero">
      <div class="lp-container lp-hero-content">
        <div class="lp-status mono"><span class="lp-pulse-dot" /> Waitlist open · first generation on testnet</div>

        <div class="lp-hero-grid">
          <div>
            <h1 class="lp-h1">
              The autonomous<br />
              <em class="lp-italic lp-light">economic </em>
              <em class="lp-italic lp-light lp-ember">engine</em>
              <span class="lp-ember">.</span>
            </h1>
            <p class="lp-hero-tagline">Raise a digital organism that earns its own living.</p>
            <p class="lp-hero-body">
              A Darwin is not a chatbot. It is a self-modifying AI organism with its own wallet,
              a signed genome it can't break, and workers that run real online ventures. It pays
              its own bills. It lives or dies by what it earns — and you hold the off switch.
            </p>
            <div class="lp-hero-actions">
              <a href="#cta" class="lp-btn">Join the waitlist →</a>
              <a href="#thesis" class="lp-btn-outline">Observe the specimen</a>
            </div>
          </div>

          <div class="lp-hero-specimen" data-specimen-anchor data-specimen-fill="0.6" aria-hidden="true">
            <span class="lp-callout lp-callout-1 mono">Membrane · soma it rewrites</span>
            <span class="lp-callout lp-callout-2 mono">Nucleus · signed DNA</span>
            <span class="lp-callout lp-callout-3 mono">13 organelles · neurons</span>
            <span class="lp-callout lp-callout-4 mono">Nutrients · revenue in</span>
          </div>
        </div>

        <div class="lp-hero-bottom">
          <div class="lp-meta-strip">
            <div v-for="[k, v] in [['Subject', 'Digital organism'], ['Fuel', 'USD · stablecoin'], ['Fate', 'Earn or perish']]" :key="k">
              <div class="upper dim" style="margin-bottom: 10px">{{ k }}</div>
              <div style="font-size: 22px; font-style: italic; font-weight: 400; letter-spacing: -0.01em">{{ v }}</div>
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

        <div class="lp-specs mono">
          <span v-for="[n, l] in SPECS" :key="l"><b>{{ n }}</b> {{ l }}</span>
        </div>
        <a href="#thesis" class="lp-scroll-cue mono">Scroll to observe ↓</a>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════ THESIS -->
    <section id="thesis" data-chapter="thesis" class="lp-section lp-bg-2">
      <div class="lp-container">
        <div class="lab-head">
          <div>
            <div class="upper dim lab-eyebrow">§ 01 — Thesis</div>
            <h2 class="lp-h2 reveal">The metaphor is <em class="lp-ember-deep lp-italic">load-bearing</em>.</h2>
          </div>
          <p class="lab-lead reveal">
            Darwin isn't a chatbot with a wallet. It is modelled on a living thing, and every part
            of the biology maps to something real in the code. Hover a row and watch the specimen respond.
          </p>
        </div>

        <div class="th-grid">
          <div class="th-anchor" data-specimen-anchor data-specimen-fill="0.7" aria-hidden="true" />
          <div class="th-table" @mouseleave="hoverMetaphor(null)">
            <button
              v-for="row in METAPHOR"
              :key="row.key"
              type="button"
              class="th-row reveal"
              :class="{ 'is-active': focus === row.key }"
              :aria-pressed="focus === row.key"
              @mouseenter="hoverMetaphor(row.key)"
              @focus="hoverMetaphor(row.key)"
              @click="hoverMetaphor(row.key)"
            >
              <span class="th-bio">{{ row.bio }}</span>
              <span class="th-darwin">{{ row.darwin }}</span>
            </button>
          </div>
        </div>
        <p class="th-quote reveal">“Not a tool you rent. <em class="lp-ember-deep">A life you own.</em>”</p>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════ ANATOMY -->
    <section id="anatomy" data-chapter="anatomy" class="lp-section">
      <div class="lp-container">
        <div class="lab-head">
          <div>
            <div class="upper dim lab-eyebrow">§ 02 — Anatomy</div>
            <h2 class="lp-h2 reveal">Five organs.<br />One <em class="lp-ember-deep lp-italic">specimen</em>.</h2>
          </div>
          <p class="lab-lead reveal">
            Two layers decide everything: a genome that never changes during a life, and a body
            that is allowed to. Around them, workers, a wallet, and a line of descendants.
          </p>
        </div>

        <div class="lp-anatomy-grid">
          <div style="border-top: 1px solid var(--darwin-ink)">
            <button
              v-for="(it, i) in anatomyItems"
              :key="it.i"
              type="button"
              class="lp-anatomy-btn"
              :class="{ 'is-active': anatomyActive === i }"
              :aria-pressed="anatomyActive === i"
              @mouseenter="anatomyActive = i"
              @focus="anatomyActive = i"
              @click="anatomyActive = i; audio.blip(1.2)"
            >
              <span class="mono lp-ember-deep lp-italic" style="font-size: 12px">{{ it.i }}</span>
              <div>
                <div style="font-size: 26px; font-weight: 400; letter-spacing: -0.02em; margin-bottom: 8px">{{ it.t }}</div>
                <div style="font-size: 14px; line-height: 1.55; color: var(--darwin-ink-soft); max-width: 480px">{{ it.d }}</div>
                <div class="mono lp-anatomy-spec">{{ it.spec }}</div>
              </div>
            </button>
          </div>

          <div class="lp-specimen-sticky">
            <div class="lp-specimen-card">
              <ClientOnly>
                <div class="lp-specimen-visual">
                  <div class="lp-specimen-grid-glow" :style="{ '--lp-specimen-hue': activeItem.hue }" />
                  <Transition name="lp-specimen-fade" mode="out-in">
                    <div :key="`specimen-${anatomyActive}`" class="lp-specimen-object">
                      <LandingAnatomyOrganScene :organ-index="activeItem.scene" :accent="activeItem.accent" :hue="activeItem.hue" />
                    </div>
                  </Transition>
                </div>
              </ClientOnly>
              <div class="lp-specimen-orbit" :style="{ '--lp-specimen-hue': activeItem.hue }">
                <span v-for="n in 3" :key="`${activeItem.i}-${n}`" class="lp-specimen-orbit-ring" :style="{ animationDelay: `${n * -2.2}s` }" />
              </div>
              <div class="lp-specimen-top">
                <span class="upper" style="color: var(--darwin-ink)">Specimen · DRW-{{ String(847 + anatomyActive).padStart(4, '0') }}</span>
                <span class="upper dim">organ · {{ activeItem.i }}</span>
              </div>
              <div class="lp-specimen-bottom">
                <div class="upper dim" style="margin-bottom: 6px">Active organ</div>
                <div style="font-size: 32px; font-style: italic; font-weight: 400; letter-spacing: -0.02em">{{ activeItem.t }}</div>
                <div class="mono lp-specimen-hint">{{ activeItem.hint }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <LandingLifecycleChapter />
    <LandingPetriDish />
    <LandingNeuronConstellation />
    <LandingTreasuryGates />
    <LandingEvolutionLab />
    <LandingTrustLab />

    <!-- ═══════════════════════════════════════════════════════ BOUNDARIES -->
    <section id="boundaries" data-chapter="boundaries" class="lp-section lp-bg-2">
      <div class="lp-container">
        <div class="upper dim lab-eyebrow">§ 09 — Boundaries</div>
        <h2 class="lp-h2 reveal" style="margin-bottom: 80px; max-width: 1100px">
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

        <div class="lp-honesty reveal">
          <span v-for="n in ['Not AGI', 'Not passive income', 'Not unsupervised', 'Not anonymous']" :key="n" class="mono">{{ n }}</span>
          <p>Most Darwins will die. The value is in the lineages that survive.</p>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════ OPERATORS -->
    <section id="operators" data-chapter="operators" class="lp-section" style="border-top: 1px solid var(--darwin-border)">
      <div class="lp-container">
        <div class="lp-section-header">
          <div class="upper dim">§ 10 — Operators in the wild</div>
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
    <section id="canvas" data-chapter="canvas" class="lp-section lab-dark">
      <div class="lp-container">
        <div class="upper lab-eyebrow">§ 11 — The Canvas</div>
        <h2 class="lp-h2 reveal" style="margin-bottom: 60px; max-width: 1100px">
          Watch them <em style="color: var(--darwin-accent)">live</em>.<br />Every bid, every burn.
        </h2>

        <div class="lp-canvas-grid">
          <div>
            <p class="lab-lead" style="margin-bottom: 32px; max-width: 480px">
              Every Darwin you own gets a canvas: a live timeline of each decision, payment,
              neuron and escalation, streamed as it happens. Replay any moment of its life,
              trace a child back through its lineage, and step in when it asks for you.
            </p>
            <div style="display: flex; flex-direction: column; gap: 16px">
              <div
                v-for="[t, d] in [['Live timeline', 'Every intent and outcome, streamed the moment it is written.'], ['Replay any moment', 'Hash-chained records you can verify yourself.'], ['Lineage tree', 'Trace any child back through every generation.']]"
                :key="t"
                style="padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.16)"
              >
                <div style="font-size: 16px; font-weight: 500; margin-bottom: 4px">{{ t }}</div>
                <div style="font-size: 13px; color: rgba(243,238,226,0.6)">{{ d }}</div>
              </div>
            </div>
          </div>

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

    <!-- ═══════════════════════════════════════════════════════ ROADMAP -->
    <section id="roadmap" data-chapter="roadmap" class="lp-section lp-bg-2">
      <div class="lp-container">
        <div class="lab-head">
          <div>
            <div class="upper dim lab-eyebrow">§ 12 — Roadmap</div>
            <h2 class="lp-h2 reveal">Four phases.<br />Each with a <em class="lp-ember-deep lp-italic">kill criterion</em>.</h2>
          </div>
          <p class="lab-lead reveal">
            Every phase ships against a written definition of done — and a condition under which
            we stop. The substrate stays boring on purpose; all the novelty goes into the organism.
          </p>
        </div>

        <div class="lp-roadmap-grid">
          <div
            v-for="(p, i) in [
              { q: 'Phase 0', t: 'Foundation', d: 'One Darwin runs end to end on testnet.', bar: '24 h without a crash · 50+ dispatches at ≥ 80% success · kill in < 5 s', status: 'now · testnet' },
              { q: 'Phase 1', t: 'Evolution loop', d: 'Self-modification and reproduction go live.', bar: '2+ generations · the first real dollar earned', status: 'next' },
              { q: 'Phase 2', t: 'Multi-tenant alpha', d: 'Friendly owners, real budgets.', bar: '5+ owners · 50%+ of Darwins survive 7 days · < $40 / month each', status: 'alpha' },
              { q: 'Phase 3', t: 'Public beta', d: 'Waitlist first, then open signup.', bar: 'Hundreds of Darwins · a public lineage 3+ months and 5+ generations deep', status: 'beta' },
            ]"
            :key="p.t"
            class="lp-roadmap-col reveal"
            :style="{ borderRight: i < 3 ? '1px solid var(--darwin-border)' : 'none' }"
          >
            <div class="mono" style="font-size: 11px; color: var(--darwin-muted); margin-bottom: 8px">{{ p.q }}</div>
            <span
              class="lp-status-badge mono"
              :style="{
                marginBottom: '32px', display: 'inline-block',
                color: i === 0 ? 'var(--darwin-bg)' : 'var(--darwin-ink)',
                background: i === 0 ? 'var(--darwin-accent)' : i === 1 ? 'var(--darwin-bg-3)' : 'transparent',
                border: i > 1 ? '1px solid var(--darwin-border)' : 'none',
              }"
            >{{ p.status }}</span>
            <h3 style="font-size: 32px; font-weight: 400; letter-spacing: -0.02em; margin-bottom: 20px; font-style: italic">{{ p.t }}</h3>
            <p style="font-size: 15px; line-height: 1.55; color: var(--darwin-ink); margin-bottom: 16px">{{ p.d }}</p>
            <p class="mono" style="font-size: 11px; line-height: 1.7; color: var(--darwin-muted)">Done when: {{ p.bar }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════ FAQ -->
    <section id="faq" data-chapter="faq" class="lp-section">
      <div class="lp-container">
        <div class="lab-head">
          <div>
            <div class="upper dim lab-eyebrow">§ 13 — Questions</div>
            <h2 class="lp-h2 reveal">Asked, and answered <em class="lp-ember-deep lp-italic">honestly</em>.</h2>
          </div>
          <p class="lab-lead reveal">
            Every answer should build trust, even the uncomfortable ones. Most Darwins die,
            and we'll never promise returns.
          </p>
        </div>
        <div class="lp-faq">
          <details v-for="f in FAQ" :key="f.q" class="lp-faq-item reveal">
            <summary>
              <h3>{{ f.q }}</h3>
              <span class="lp-faq-plus" aria-hidden="true">+</span>
            </summary>
            <p>{{ f.a }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════ CTA + FOOTER -->
    <section id="cta" data-chapter="cta" class="lp-cta-section lab-dark">
      <div class="lp-container lp-cta-content">
        <div class="upper lab-eyebrow">§ 14 — Field access</div>
        <h2 class="lp-cta-h2">
          Be there when the first<br />generation is <em style="color: var(--darwin-accent)">born</em>.
        </h2>

        <form class="lp-cta-form" @submit.prevent="submitCta">
          <input
            v-model="ctaEmail"
            type="email"
            placeholder="you@lab.org"
            aria-label="Email address"
            autocomplete="email"
            maxlength="254"
            :disabled="ctaSubmitted || ctaSending"
            required
            class="lp-cta-input"
          />
          <button type="submit" class="lp-btn lp-btn-ember" :disabled="ctaSubmitted || ctaSending">
            {{ ctaSubmitted ? 'On the list ✓' : ctaSending ? 'Sending…' : 'Join the waitlist →' }}
          </button>
        </form>
        <p v-if="ctaError" role="alert" class="lp-cta-error">{{ ctaError }}</p>
        <p style="font-size: 13px; color: var(--darwin-muted-2); max-width: 560px">
          Real stakes. Real selection. No hype. Most Darwins will die — the ones that don't will be the first of their kind.
        </p>
      </div>

      <footer class="lp-container lp-footer">
        <div class="lp-footer-brand">
          <svg width="18" height="18" viewBox="0 0 22 22" aria-hidden="true">
            <circle cx="11" cy="11" r="10" fill="none" stroke="#f3eee2" stroke-width="1.4" />
            <circle cx="11" cy="11" r="3.5" fill="#ff5b1f" />
          </svg>
          <span>Darwin Agents · a <a href="https://nexow.studio" rel="noopener">Nexow Studio</a> product, in collaboration with <a href="https://specimenlabs.com" rel="noopener">Specimen Labs</a></span>
        </div>
        <div class="lp-footer-links">
          <a href="#thesis">Specimen</a>
          <a href="#trust">Trust</a>
          <a href="#faq">FAQ</a>
          <a href="/llms.txt">llms.txt</a>
          <a href="mailto:security@darwinagents.com">Security</a>
          <NuxtLink to="/login">Sign in</NuxtLink>
        </div>
        <div class="mono" style="font-size: 11px; color: var(--darwin-muted)">© 2026 Nexow, Inc. · Specimen Labs, Inc.</div>
      </footer>
    </section>
  </div>
</template>

<style scoped>
/* Shared lab typography/buttons live in assets/css/main.css (.lp-root …). */
.grain {
  position: fixed; inset: 0; pointer-events: none; z-index: 1;
  opacity: 0.05; mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}

/* ── Header ──────────────────────────────────────────────────────────────── */
.lp-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  background: rgba(243, 238, 226, 0.6); color: var(--darwin-ink);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border-bottom: 1px solid rgba(10, 10, 10, 0.08);
  transition: background 0.6s, color 0.6s, border-color 0.6s;
}
.lp-header.is-dark { background: rgba(10, 10, 10, 0.55); color: var(--darwin-bg); border-color: rgba(243, 238, 226, 0.08); }
.lp-nav { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; padding-bottom: 14px; }
.lp-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit; }
.lp-logo-name { font-weight: 500; letter-spacing: -0.01em; font-size: 15px; }
.lp-logo-tag { margin-left: 8px; }
.lp-navlinks { display: flex; gap: 28px; font-size: 13px; }
.lp-navlinks a { text-decoration: none; color: inherit; transition: color 0.2s; }
.lp-navlinks a:hover { color: var(--darwin-accent); }
.lp-nav-actions { display: flex; align-items: center; gap: 8px; }
.lp-sound {
  display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px;
  border-radius: 50%; border: 1px solid currentColor; border-color: color-mix(in srgb, currentColor 25%, transparent);
  background: transparent; color: inherit; cursor: pointer; transition: background 0.2s;
}
.lp-sound:hover { background: color-mix(in srgb, currentColor 10%, transparent); }
.lp-sound[aria-pressed='true'] { color: var(--darwin-accent); border-color: var(--darwin-accent); }
.lp-btn-ghost-ink {
  display: inline-flex; align-items: center; padding: 10px 16px; border-radius: 100px;
  font-size: 13px; font-weight: 500; text-decoration: none; color: inherit; opacity: 0.8; transition: opacity 0.2s, background 0.2s;
}
.lp-btn-ghost-ink:hover { opacity: 1; background: color-mix(in srgb, currentColor 8%, transparent); }
.lp-nav-cta { padding: 12px 22px; }
.is-dark .lp-nav-cta { background: var(--darwin-accent); color: var(--darwin-ink); }

/* ── Hero ─────────────────────────────────────────────────────────────────── */
.lp-hero { position: relative; min-height: 100vh; overflow: hidden; }
.lp-hero-content { padding-top: calc(72px + 6vh); padding-bottom: 6vh; }
.lp-status {
  display: inline-flex; align-items: center; gap: 10px; padding: 8px 14px; border-radius: 100px;
  border: 1px solid var(--darwin-border); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--darwin-ink-soft); background: rgba(243, 238, 226, 0.6); margin-bottom: 32px;
}
.lp-h1 { font-size: clamp(52px, 8vw, 136px); line-height: 0.92; letter-spacing: -0.04em; font-weight: 400; text-wrap: balance; margin-bottom: 28px; }
.lp-hero-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 48px; align-items: center; }
.lp-hero-tagline { font-size: 24px; font-style: italic; letter-spacing: -0.01em; margin-bottom: 16px; }
.lp-hero-body { font-size: 18px; line-height: 1.55; color: var(--darwin-ink-soft); max-width: 560px; margin-bottom: 36px; }
.lp-hero-actions { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
.lp-hero-specimen { position: relative; aspect-ratio: 1; width: 100%; max-width: 620px; justify-self: center; }
.lp-callout {
  position: absolute; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--darwin-ink-soft);
  display: flex; align-items: center; gap: 8px; white-space: nowrap;
  animation: lp-callout-in 0.8s ease both;
}
.lp-callout::before { content: ''; width: 28px; height: 1px; background: currentColor; opacity: 0.5; }
.lp-callout-1 { top: 10%; right: 0; animation-delay: 0.6s; }
.lp-callout-2 { top: 46%; left: -4%; flex-direction: row-reverse; animation-delay: 0.8s; }
.lp-callout-2::before { width: 40px; }
.lp-callout-3 { bottom: 16%; right: 2%; animation-delay: 1s; }
.lp-callout-4 { bottom: 4%; left: 6%; animation-delay: 1.2s; }
@keyframes lp-callout-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

.lp-hero-bottom { display: grid; grid-template-columns: 1fr 460px; gap: 48px; align-items: end; margin-top: 56px; }
.lp-meta-strip { display: grid; grid-template-columns: repeat(3, max-content); gap: 64px; padding-top: 32px; border-top: 1px solid var(--darwin-border); }
.lp-specs { display: flex; flex-wrap: wrap; gap: 10px 32px; margin-top: 48px; font-size: 11px; color: var(--darwin-muted); letter-spacing: 0.06em; text-transform: uppercase; }
.lp-specs b { color: var(--darwin-ink); font-weight: 500; font-size: 13px; margin-right: 4px; }
.lp-scroll-cue { display: inline-block; margin-top: 40px; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--darwin-muted); text-decoration: none; animation: lp-bob 2.4s ease-in-out infinite; }
@keyframes lp-bob { 50% { transform: translateY(6px); } }

/* Live Ledger card */
.lp-ledger-card {
  background: rgba(243, 238, 226, 0.7);
  border: 1px solid var(--darwin-border); border-radius: 14px;
  padding: 22px; backdrop-filter: blur(12px);
  box-shadow: 0 30px 80px -40px rgba(10, 10, 10, 0.25);
}
.lp-ledger-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.lp-streaming-badge {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--darwin-font-mono); font-size: 11px;
  text-transform: uppercase; letter-spacing: 0.18em; font-weight: 500; color: #1f8a3e;
}
.lp-pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: #1f8a3e; animation: lp-pulse 1.4s infinite; }
@keyframes lp-pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.3 } }
.lp-ledger-rows { display: flex; flex-direction: column; gap: 4px; margin-bottom: 18px; min-height: 196px; }
.lp-ledger-row { display: grid; grid-template-columns: auto 1fr auto; gap: 16px; padding: 5px 0; font-size: 12px; align-items: center; animation: lp-row-in 0.4s ease; }
@keyframes lp-row-in { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: none } }
.lp-ledger-id { color: var(--darwin-ink); font-weight: 500; }
.lp-ledger-action { color: var(--darwin-ink-soft); }
.lp-ledger-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding-top: 16px; border-top: 1px solid var(--darwin-border); }

/* ── Thesis ──────────────────────────────────────────────────────────────── */
.th-grid { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 64px; align-items: start; }
.th-anchor { position: sticky; top: 18vh; aspect-ratio: 1; width: 100%; max-width: 520px; }
.th-table { border-top: 1px solid var(--darwin-ink); }
.th-row {
  display: grid; grid-template-columns: 180px 1fr; gap: 24px; width: 100%; text-align: left;
  padding: 18px 12px; border: none; border-bottom: 1px solid var(--darwin-border); background: transparent;
  color: var(--darwin-ink); cursor: pointer; transition: background 0.25s, padding 0.25s;
}
.th-row:hover, .th-row.is-active { background: var(--darwin-bg); padding-left: 20px; }
.th-bio { font-size: 20px; font-style: italic; letter-spacing: -0.01em; }
.th-row.is-active .th-bio { color: var(--darwin-accent-deep); }
.th-darwin { font-size: 15px; line-height: 1.5; color: var(--darwin-ink-soft); }
.th-quote { margin-top: 80px; font-size: clamp(28px, 3.4vw, 48px); letter-spacing: -0.03em; text-align: center; font-style: italic; }

/* ── Anatomy ─────────────────────────────────────────────────────────────── */
.lp-anatomy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
.lp-anatomy-btn {
  display: grid; grid-template-columns: 64px 1fr; gap: 24px;
  width: 100%; text-align: left; padding: 28px 0;
  border: none; border-bottom: 1px solid var(--darwin-border);
  background: transparent; cursor: pointer; transition: opacity 0.2s; color: var(--darwin-ink); opacity: 0.5;
}
.lp-anatomy-btn.is-active { opacity: 1; }
.lp-anatomy-spec { font-size: 11px; color: var(--darwin-accent-deep); margin-top: 10px; letter-spacing: 0.02em; }
.lp-specimen-sticky { position: sticky; top: 90px; }
.lp-specimen-card { position: relative; aspect-ratio: 4/5; background: var(--darwin-bg-2); border: 1px solid var(--darwin-border); overflow: hidden; }
.lp-specimen-visual, .lp-specimen-object { position: absolute; inset: 0; }
.lp-specimen-grid-glow {
  position: absolute; inset: 0; pointer-events: none;
  background:
    linear-gradient(rgba(10, 10, 10, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(10, 10, 10, 0.04) 1px, transparent 1px),
    radial-gradient(circle at 45% 35%, color-mix(in srgb, var(--lp-specimen-hue) 24%, transparent), transparent 58%);
  background-size: 32px 32px, 32px 32px, 100% 100%;
  opacity: 0.65;
}
.lp-specimen-fade-enter-active, .lp-specimen-fade-leave-active { transition: opacity 280ms ease, transform 280ms ease; }
.lp-specimen-fade-enter-from, .lp-specimen-fade-leave-to { opacity: 0; transform: scale(0.985); }
.lp-specimen-orbit { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
.lp-specimen-orbit-ring {
  position: absolute; width: 58%; aspect-ratio: 1 / 1;
  border: 1px solid color-mix(in srgb, var(--lp-specimen-hue) 38%, transparent);
  border-radius: 999px; left: 50%; top: 50%;
  transform: translate(-50%, -50%) rotate(18deg);
  animation: lp-orbit-spin 10s linear infinite;
}
.lp-specimen-orbit-ring:nth-child(2) { width: 76%; transform: translate(-50%, -50%) rotate(-24deg); }
.lp-specimen-orbit-ring:nth-child(3) { width: 92%; transform: translate(-50%, -50%) rotate(42deg); }
.lp-specimen-hint { margin-top: 14px; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--darwin-muted); }
@keyframes lp-orbit-spin { from { rotate: 0deg; opacity: 0.45; } 50% { opacity: 0.16; } to { rotate: 360deg; opacity: 0.45; } }
.lp-specimen-top { position: absolute; top: 24px; left: 24px; right: 24px; display: flex; justify-content: space-between; z-index: 2; }
.lp-specimen-bottom { position: absolute; bottom: 24px; left: 24px; right: 24px; z-index: 2; }

/* ── Boundaries ──────────────────────────────────────────────────────────── */
.lp-wiinot-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border-top: 1px solid var(--darwin-ink); }
.lp-wiinot-col { padding: 40px 28px 56px; min-height: 320px; }
.lp-honesty { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 28px; margin-top: 56px; padding-top: 28px; border-top: 1px solid var(--darwin-border); }
.lp-honesty span { font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: line-through; text-decoration-color: var(--darwin-accent); color: var(--darwin-ink-soft); }
.lp-honesty p { flex-basis: 100%; font-size: clamp(22px, 2.4vw, 32px); letter-spacing: -0.02em; font-style: italic; margin-top: 12px; }

/* ── Operators ───────────────────────────────────────────────────────────── */
.lp-section-header { display: grid; grid-template-columns: 1fr 2fr; gap: 80px; margin-bottom: 100px; align-items: end; }
.lp-ops-row { display: grid; grid-template-columns: 1.4fr 2fr 1fr 1fr 1fr 0.8fr; padding: 18px 0; align-items: baseline; }
.lp-ops-header { border-bottom: 1px solid var(--darwin-border); }
.lp-ops-data { padding: 28px 0; }
.lp-ops-num { font-size: 14px; text-align: right; }
.lp-status-badge { display: inline-block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; padding: 3px 10px; }

/* ── Canvas ──────────────────────────────────────────────────────────────── */
.lp-canvas-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 60px; align-items: start; }
.lp-feed-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.14); padding: 24px; font-size: 12px; min-height: 520px; backdrop-filter: blur(6px); }
.lp-feed-header { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 11px; color: var(--darwin-muted-2); text-transform: uppercase; letter-spacing: 0.12em; }
.lp-feed-row { display: grid; grid-template-columns: 90px 1fr auto; gap: 12px; padding: 5px 0; }

/* ── Roadmap ─────────────────────────────────────────────────────────────── */
.lp-roadmap-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border-top: 1px solid var(--darwin-ink); }
.lp-roadmap-col { padding: 40px 28px 56px; position: relative; min-height: 320px; }

/* ── FAQ ─────────────────────────────────────────────────────────────────── */
.lp-faq { border-top: 1px solid var(--darwin-ink); max-width: 1000px; margin-left: auto; }
.lp-faq-item { border-bottom: 1px solid var(--darwin-border); }
.lp-faq-item summary { list-style: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 24px; padding: 26px 0; }
.lp-faq-item summary::-webkit-details-marker { display: none; }
.lp-faq-item h3 { font-size: clamp(20px, 2vw, 26px); font-weight: 400; letter-spacing: -0.02em; }
.lp-faq-item[open] h3 { color: var(--darwin-accent-deep); }
.lp-faq-plus { font-size: 22px; transition: transform 0.25s; flex-shrink: 0; }
.lp-faq-item[open] .lp-faq-plus { transform: rotate(45deg); }
.lp-faq-item p { font-size: 17px; line-height: 1.6; color: var(--darwin-ink-soft); max-width: 760px; padding: 0 0 28px; }

/* ── CTA + footer ────────────────────────────────────────────────────────── */
.lp-cta-section { padding: 200px 0 80px; position: relative; overflow: hidden; }
.lp-cta-h2 {
  font-size: clamp(52px, 8.4vw, 156px); line-height: 0.92; letter-spacing: -0.045em; font-weight: 400;
  margin-bottom: 60px; max-width: 1300px; text-wrap: balance; color: var(--darwin-bg);
}
.lp-cta-form { display: flex; gap: 12px; max-width: 640px; margin-bottom: 32px; }
.lp-cta-input {
  flex: 1; padding: 20px 24px; font-size: 16px; font-family: var(--darwin-font-sans);
  background: rgba(10, 10, 10, 0.4); color: var(--darwin-bg);
  border: 1px solid rgba(255,255,255,0.24); border-radius: 100px; outline: none; backdrop-filter: blur(6px);
}
.lp-cta-input::placeholder { color: rgba(243,238,226,0.4); }
.lp-cta-input:focus { border-color: var(--darwin-accent); }
.lp-cta-input:disabled { opacity: 0.6; }
.lp-cta-error { margin: -20px 0 24px; font-size: 13px; color: #ff8a5b; }
.lp-footer {
  margin-top: 160px; padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.16);
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px;
}
.lp-footer-brand { display: flex; align-items: center; gap: 12px; font-size: 14px; }
.lp-footer-brand a { color: var(--darwin-bg); text-decoration-color: rgba(243, 238, 226, 0.3); }
.lp-footer-links { display: flex; gap: 28px; font-size: 13px; }
.lp-footer-links a { text-decoration: none; color: var(--darwin-muted-2); transition: color 0.2s; }
.lp-footer-links a:hover { color: var(--darwin-bg); }

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 1100px) {
  .lp-hero-bottom { grid-template-columns: 1fr; }
}
@media (max-width: 1024px) {
  .lp-hero-grid { grid-template-columns: 1fr; gap: 8px; }
  .lp-hero-specimen { max-width: 360px; order: -1; }
  .th-grid { grid-template-columns: 1fr; }
  .th-anchor { display: none; }
  .lp-anatomy-grid { grid-template-columns: 1fr; gap: 40px; }
  .lp-specimen-sticky { position: static; }
  .lp-canvas-grid { grid-template-columns: 1fr; }
  .lp-wiinot-grid { grid-template-columns: repeat(2, 1fr); }
  .lp-roadmap-grid { grid-template-columns: repeat(2, 1fr); }
  .lp-ops-row { grid-template-columns: 1fr 1fr; gap: 16px; }
  .lp-ops-header { display: none; }
  .lp-ops-num { text-align: left; }
  .lp-ops-num::before {
    content: attr(data-label); display: block; margin-bottom: 4px;
    font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--darwin-muted);
  }
  .lp-section-header { grid-template-columns: 1fr; gap: 28px; margin-bottom: 56px; }
}
@media (max-width: 900px) {
  .lp-navlinks { display: none; }
}
@media (max-width: 720px) {
  .lp-logo-tag, .lp-btn-ghost-ink { display: none; }
  .lp-nav-cta { padding: 10px 16px; }
  .lp-hero-specimen { max-width: 240px; }
  .lp-callout { display: none; }
  .lp-meta-strip { grid-template-columns: 1fr; gap: 24px; }
  .th-row { grid-template-columns: 1fr; gap: 4px; }
  .lp-wiinot-grid, .lp-roadmap-grid { grid-template-columns: 1fr; }
  .lp-wiinot-col, .lp-roadmap-col { border-right: none !important; border-bottom: 1px solid var(--darwin-border); }
  .lp-cta-form { flex-direction: column; }
  .lp-footer { flex-direction: column; align-items: flex-start; }
}
@media (prefers-reduced-motion: reduce) {
  .lp-scroll-cue, .lp-callout, .lp-pulse-dot, .lp-specimen-orbit-ring { animation: none; }
}
</style>
