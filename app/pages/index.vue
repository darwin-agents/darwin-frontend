<script setup lang="ts">
import { Volume2, VolumeX } from 'lucide-vue-next'

definePageMeta({ layout: false })

const { t, localeProperties } = useI18n()

const seoDescription = () => t('landing.seo.description')
const seoTitle = () => t('landing.seo.ogTitle')
useSeoMeta({
  title: () => t('landing.seo.title'),
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogType: 'website',
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
})

// ── FAQ (docs/marketing/08-faq.md): visible on the page and mirrored as FAQPage data ─
const FAQ_IDS = ['what', 'money', 'loss', 'stop', 'technical', 'crypto', 'death', 'fees', 'safe', 'mostDie', 'when']
const FAQ = computed(() => FAQ_IDS.map((id) => ({ q: t(`landing.faq.items.${id}.q`), a: t(`landing.faq.items.${id}.a`) })))

const site = useRuntimeConfig().public.siteUrl
useHead({
  script: [{
    key: 'ld-json',
    type: 'application/ld+json',
    innerHTML: () => JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Organization', '@id': `${site}/#nexow`, name: 'Nexow, Inc.', alternateName: 'Nexow Studio', url: 'https://nexow.studio' },
        { '@type': 'Organization', '@id': `${site}/#specimen-labs`, name: 'Specimen Labs, Inc.', url: 'https://specimenlabs.com' },
        { '@type': 'WebSite', '@id': `${site}/#website`, url: `${site}/`, name: 'Darwin Agents', inLanguage: localeProperties.value.language, publisher: { '@id': `${site}/#nexow` } },
        {
          '@type': 'SoftwareApplication',
          '@id': `${site}/#app`,
          name: 'Darwin Agents',
          url: `${site}/`,
          image: `${site}/og.png`,
          description: seoDescription(),
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          creator: [{ '@id': `${site}/#nexow` }, { '@id': `${site}/#specimen-labs` }],
        },
        {
          '@type': 'FAQPage',
          '@id': `${site}/#faq`,
          inLanguage: localeProperties.value.language,
          mainEntity: FAQ.value.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
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
// `action` / `what` are ids under landing.activity.verbs / landing.activity.items.
interface LedgerRow {
  id: string
  action: string
  what: string
  amount: number
  fmt: string
  ts: number
}

const SEED_ROWS: LedgerRow[] = [
  { id: 'DRW-0142', action: 'spent',    what: 'visionPass',   amount: -7.74,   fmt: '$7.74',   ts: 1 },
  { id: 'DRW-0287', action: 'earned',   what: 'adClick',      amount: 319.60,  fmt: '$319.60', ts: 2 },
  { id: 'DRW-1334', action: 'spent',    what: 'proxyReq',     amount: -3.64,   fmt: '$3.64',   ts: 3 },
  { id: 'DRW-1024', action: 'spent',    what: 'scrapeWorker', amount: -7.51,   fmt: '$7.51',   ts: 4 },
  { id: 'DRW-0613', action: 'deployed', what: '',             amount: 319,     fmt: '$319',    ts: 5 },
  { id: 'DRW-0822', action: 'billed',   what: 'adCampaign',   amount: 767.88,  fmt: '$767.88', ts: 6 },
]

function genRow(): LedgerRow {
  const actions: [string, string[], number][] = [
    ['spent',    ['visionPass', 'proxyReq', 'scrapeWorker', 'gpt4o', 'toolCall'], -1],
    ['earned',   ['adClick', 'shopifySale', 'subscription', 'affiliate', 'apiCall'], 1],
    ['billed',   ['adCampaign', 'storefront', 'subscription'], 1],
    ['deployed', [''], 1],
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
    ['paid',    ['gpt4o', 'proxy', 'browserSandbox', 'embeddings'], -1],
    ['earned',  ['adClick', 'subRenewal', 'shopifySale', 'apiCall'], 1],
    ['forked',  [''], 1],
    ['retired', [''], -1],
  ]
  const vpick = verbs[Math.floor(Math.random() * verbs.length)]!
  const [verb, whats, sign] = vpick
  const what = whats[Math.floor(Math.random() * whats.length)] ?? ''
  const amount = sign * (Math.random() * (sign > 0 ? 600 : 9) + 0.4)
  const d = new Date()
  return {
    k: Math.random(),
    ts: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`,
    id: 'DRW-' + Math.floor(Math.random() * 9000 + 100).toString().padStart(4, '0'),
    verb, what, amount,
  }
}

// Seeded on mount: random rows rendered during SSR would never match the client.
const canvasFeed = ref<FeedEvent[]>([])

// ── Thesis: the biological metaphor (docs/overview/01-vision-and-metaphor.md) ─
const METAPHOR = ['genome', 'soma', 'neurons', 'metabolism', 'food', 'hunger', 'death', 'reproduction', 'generation', 'mutation', 'selection', 'owner']
function hoverMetaphor(key: string | null) {
  if (key === focus.value) return
  focus.value = key
  if (key) audio.blip(0.9)
}

// ── Anatomy ──────────────────────────────────────────────────────────────────
const anatomyActive = ref(0)
const anatomyItems = [
  { id: 'dna', i: 'I', scene: 2, accent: '#c93f0a', hue: '#f3eee2' },
  { id: 'soma', i: 'II', scene: 0, accent: '#ff5b1f', hue: '#f3eee2' },
  { id: 'neurons', i: 'III', scene: 1, accent: '#0a0a0a', hue: '#ff8a5b' },
  { id: 'treasury', i: 'IV', scene: 3, accent: '#f3eee2', hue: '#ff7f45' },
  { id: 'lineage', i: 'V', scene: 4, accent: '#ff5b1f', hue: '#ffb08a' },
]
const activeItem = computed(() => anatomyItems[anatomyActive.value] ?? anatomyItems[0]!)

const SPECS = [
  ['13', 'neurons'],
  ['9', 'heartbeat'],
  ['6', 'treasuryChecks'],
  ['10', 'principles'],
  ['1,800+', 'tests'],
]

// ── Boundaries, operators, roadmap ──────────────────────────────────────────
const NOT_DARWIN = ['chatbot', 'workflow', 'copilot', 'organism']
const OPERATORS = [
  ['trader',     '$2.4M',  '+38.2%', '4,210', 'live'],
  ['storefront', '$1.1M',  '+22.6%', '1,860', 'live'],
  ['researcher', '$640k',  '+11.4%', '3,022', 'live'],
  ['service',    '$420k',  '+9.7%',  '1,140', 'live'],
  ['studio',     '$310k',  '+6.3%',  '610',   'next'],
  ['sovereign',  '—',      '—',      '—',     'horizon'],
]
const PHASES = ['foundation', 'evolution', 'alpha', 'beta']

// ── CTA ───────────────────────────────────────────────────────────────────────
const supabase = useSupabaseClient()
const ctaEmail = ref('')
const ctaSubmitted = ref(false)
const ctaSending = ref(false)
const ctaError = ref(false)
async function submitCta() {
  ctaSending.value = true
  ctaError.value = false
  // ponytail: anon insert has no rate limit; move behind a Nitro route with a service key if spam shows up
  const { error } = await supabase
    .from('waitlist')
    .insert({ email: ctaEmail.value.trim().toLowerCase(), source: 'landing' })
  ctaSending.value = false
  // 23505 = unique violation: already on the list, which is success for the visitor
  if (error && error.code !== '23505') {
    ctaError.value = true
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
          <UiDarwinLogo :size="26" />
          <span class="lp-logo-name">Darwin</span>
          <span class="upper dim lp-logo-tag">Agents · v0.7</span>
        </a>
        <nav class="lp-navlinks" :aria-label="t('landing.nav.sections')">
          <a href="#thesis">{{ t('lab.chapters.hero') }}</a>
          <a href="#lifecycle">{{ t('lab.chapters.lifecycle') }}</a>
          <a href="#evolution">{{ t('lab.chapters.evolution') }}</a>
          <a href="#trust">{{ t('lab.chapters.trust') }}</a>
          <a href="#roadmap">{{ t('lab.chapters.roadmap') }}</a>
        </nav>
        <div class="lp-nav-actions">
          <LandingLabTelemetry />
          <UiInstallButton compact />
          <UiLocaleSwitcher class="lp-nav-locale" />
          <button
            type="button"
            class="lp-sound"
            :aria-pressed="audio.enabled.value"
            :aria-label="audio.enabled.value ? t('landing.nav.soundOff') : t('landing.nav.soundOn')"
            @click="audio.setEnabled(!audio.enabled.value)"
          >
            <Volume2 v-if="audio.enabled.value" :size="16" />
            <VolumeX v-else :size="16" />
          </button>
          <NuxtLink to="/login" class="lp-btn-ghost-ink">{{ t('landing.nav.signIn') }}</NuxtLink>
          <a href="#cta" class="lp-btn lp-nav-cta">{{ t('landing.nav.join') }}</a>
        </div>
      </div>
    </header>

    <!-- ═══════════════════════════════════════════════════════ HERO -->
    <section id="top" data-chapter="hero" class="lp-hero">
      <div class="lp-container lp-hero-content">
        <div class="lp-status mono"><span class="lp-pulse-dot" /> {{ t('landing.hero.status') }}</div>

        <div class="lp-hero-grid">
          <div>
            <i18n-t keypath="landing.hero.title" tag="h1" class="lp-h1" scope="global">
              <template #br><br /></template>
              <template #economic><em class="lp-italic lp-light">{{ t('landing.hero.titleEconomic') }}</em></template>
              <template #engine><em class="lp-italic lp-light lp-ember">{{ t('landing.hero.titleEngine') }}</em></template>
              <template #dot><span class="lp-ember">{{ t('landing.hero.titleDot') }}</span></template>
            </i18n-t>
            <p class="lp-hero-tagline">{{ t('landing.hero.tagline') }}</p>
            <p class="lp-hero-body">{{ t('landing.hero.body') }}</p>
            <div class="lp-hero-actions">
              <a href="#cta" class="lp-btn">{{ t('landing.hero.join') }}</a>
              <a href="#thesis" class="lp-btn-outline">{{ t('landing.hero.observe') }}</a>
            </div>
          </div>

          <div class="lp-hero-specimen" data-specimen-anchor data-specimen-fill="0.6" aria-hidden="true">
            <span class="lp-callout lp-callout-1 mono">{{ t('landing.hero.callouts.membrane') }}</span>
            <span class="lp-callout lp-callout-2 mono">{{ t('landing.hero.callouts.nucleus') }}</span>
            <span class="lp-callout lp-callout-3 mono">{{ t('landing.hero.callouts.organelles') }}</span>
            <span class="lp-callout lp-callout-4 mono">{{ t('landing.hero.callouts.nutrients') }}</span>
          </div>
        </div>

        <div class="lp-hero-bottom">
          <div class="lp-meta-strip">
            <div v-for="k in ['subject', 'fuel', 'fate']" :key="k">
              <div class="upper dim" style="margin-bottom: 10px">{{ t(`landing.hero.meta.${k}.label`) }}</div>
              <div style="font-size: 22px; font-style: italic; font-weight: 400; letter-spacing: -0.01em">{{ t(`landing.hero.meta.${k}.value`) }}</div>
            </div>
          </div>

          <!-- Live Ledger Card -->
          <div class="lp-ledger-card">
            <div class="lp-ledger-header">
              <span class="upper">{{ t('landing.ledger.title') }}</span>
              <span class="lp-streaming-badge">
                <span class="lp-pulse-dot" />
                {{ t('landing.ledger.streaming') }}
              </span>
            </div>
            <div class="lp-ledger-rows">
              <div
                v-for="row in ledgerRows"
                :key="row.ts"
                class="lp-ledger-row mono"
              >
                <span class="lp-ledger-id">{{ row.id }}</span>
                <span class="lp-ledger-action">{{ t(`landing.activity.verbs.${row.action}`) }} · <span class="lp-mute">{{ row.what && t(`landing.activity.items.${row.what}`) }}</span></span>
                <span :class="row.amount > 0 ? 'lp-pos' : 'lp-neg'">
                  {{ row.amount > 0 ? '+' : '' }}{{ row.fmt }}
                </span>
              </div>
            </div>
            <div class="lp-ledger-stats">
              <div v-for="[k, v] in [['alive', stats.alive.toLocaleString('en-US')], ['revenue', '$' + (stats.revenue / 1000).toFixed(1) + 'k'], ['perished', stats.perished.toLocaleString('en-US')]]" :key="k">
                <div class="upper dim" style="margin-bottom: 4px; font-size: 10px">{{ t(`landing.ledger.stats.${k}`) }}</div>
                <div style="font-size: 18px; font-style: italic">{{ v }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="lp-specs mono">
          <span v-for="[n, l] in SPECS" :key="l"><b>{{ n }}</b> {{ t(`landing.hero.specs.${l}`) }}</span>
        </div>
        <a href="#thesis" class="lp-scroll-cue mono">{{ t('landing.hero.scrollCue') }}</a>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════ THESIS -->
    <section id="thesis" data-chapter="thesis" class="lp-section lp-bg-2">
      <div class="lp-container">
        <div class="lab-head">
          <div>
            <div class="upper dim lab-eyebrow">{{ t('landing.thesis.eyebrow') }}</div>
            <i18n-t keypath="landing.thesis.title" tag="h2" class="lp-h2 reveal" scope="global">
              <template #em><em class="lp-ember-deep lp-italic">{{ t('landing.thesis.titleEm') }}</em></template>
            </i18n-t>
          </div>
          <p class="lab-lead reveal">{{ t('landing.thesis.lead') }}</p>
        </div>

        <div class="th-grid">
          <div class="th-anchor" data-specimen-anchor data-specimen-fill="0.7" aria-hidden="true" />
          <div class="th-table" @mouseleave="hoverMetaphor(null)">
            <button
              v-for="key in METAPHOR"
              :key="key"
              type="button"
              class="th-row reveal"
              :class="{ 'is-active': focus === key }"
              :aria-pressed="focus === key"
              @mouseenter="hoverMetaphor(key)"
              @focus="hoverMetaphor(key)"
              @click="hoverMetaphor(key)"
            >
              <span class="th-bio">{{ t(`landing.thesis.rows.${key}.bio`) }}</span>
              <span class="th-darwin">{{ t(`landing.thesis.rows.${key}.darwin`) }}</span>
            </button>
          </div>
        </div>
        <i18n-t keypath="landing.thesis.quote" tag="p" class="th-quote reveal" scope="global">
          <template #em><em class="lp-ember-deep">{{ t('landing.thesis.quoteEm') }}</em></template>
        </i18n-t>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════ ANATOMY -->
    <section id="anatomy" data-chapter="anatomy" class="lp-section">
      <div class="lp-container">
        <div class="lab-head">
          <div>
            <div class="upper dim lab-eyebrow">{{ t('landing.anatomy.eyebrow') }}</div>
            <i18n-t keypath="landing.anatomy.title" tag="h2" class="lp-h2 reveal" scope="global">
              <template #br><br /></template>
              <template #em><em class="lp-ember-deep lp-italic">{{ t('landing.anatomy.titleEm') }}</em></template>
            </i18n-t>
          </div>
          <p class="lab-lead reveal">{{ t('landing.anatomy.lead') }}</p>
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
                <div style="font-size: 26px; font-weight: 400; letter-spacing: -0.02em; margin-bottom: 8px">{{ t(`landing.anatomy.items.${it.id}.title`) }}</div>
                <div style="font-size: 14px; line-height: 1.55; color: var(--darwin-ink-soft); max-width: 480px">{{ t(`landing.anatomy.items.${it.id}.body`) }}</div>
                <div class="mono lp-anatomy-spec">{{ t(`landing.anatomy.items.${it.id}.spec`) }}</div>
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
                <span class="upper" style="color: var(--darwin-ink)">{{ t('landing.anatomy.specimen', { id: `DRW-${String(847 + anatomyActive).padStart(4, '0')}` }) }}</span>
                <span class="upper dim">{{ t('landing.anatomy.organ', { n: activeItem.i }) }}</span>
              </div>
              <div class="lp-specimen-bottom">
                <div class="upper dim" style="margin-bottom: 6px">{{ t('landing.anatomy.activeOrgan') }}</div>
                <div style="font-size: 32px; font-style: italic; font-weight: 400; letter-spacing: -0.02em">{{ t(`landing.anatomy.items.${activeItem.id}.title`) }}</div>
                <div class="mono lp-specimen-hint">{{ t(`landing.anatomy.items.${activeItem.id}.hint`) }}</div>
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
        <div class="upper dim lab-eyebrow">{{ t('landing.boundaries.eyebrow') }}</div>
        <i18n-t keypath="landing.boundaries.title" tag="h2" class="lp-h2 reveal" style="margin-bottom: 80px; max-width: 1100px" scope="global">
          <template #em><em class="lp-ember-deep lp-italic">{{ t('landing.boundaries.titleEm') }}</em></template>
        </i18n-t>

        <div class="lp-wiinot-grid">
          <div
            v-for="(id, i) in NOT_DARWIN"
            :key="id"
            class="lp-wiinot-col"
            :style="{
              borderInlineEnd: i < 3 ? '1px solid var(--darwin-border)' : 'none',
              background: i === 3 ? 'var(--darwin-ink)' : 'transparent',
              color: i === 3 ? 'var(--darwin-bg)' : 'var(--darwin-ink)',
            }"
          >
            <div class="upper" :style="{ color: i === 3 ? 'var(--darwin-accent)' : 'var(--darwin-muted)', marginBottom: '32px' }">{{ i === 3 ? t('landing.boundaries.thisIsIt') : t('landing.boundaries.notThis') }}</div>
            <h3 style="font-size: 36px; font-weight: 400; letter-spacing: -0.02em; margin-bottom: 20px; font-style: italic">{{ t(`landing.boundaries.cols.${id}.title`) }}</h3>
            <p :style="{ fontSize: '14px', lineHeight: '1.6', color: i === 3 ? 'rgba(243,238,226,0.72)' : 'var(--darwin-ink-soft)' }">{{ t(`landing.boundaries.cols.${id}.body`) }}</p>
            <div v-if="i === 3" style="margin-top: 32px">
              <span class="upper" style="color: var(--darwin-accent)">★ Darwin</span>
            </div>
          </div>
        </div>

        <div class="lp-honesty reveal">
          <span v-for="n in ['agi', 'passive', 'unsupervised', 'anonymous']" :key="n" class="mono">{{ t(`landing.boundaries.honesty.${n}`) }}</span>
          <p>{{ t('landing.boundaries.honesty.line') }}</p>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════ OPERATORS -->
    <section id="operators" data-chapter="operators" class="lp-section" style="border-top: 1px solid var(--darwin-border)">
      <div class="lp-container">
        <div class="lp-section-header">
          <div class="upper dim">{{ t('landing.operators.eyebrow') }}</div>
          <i18n-t keypath="landing.operators.title" tag="h2" class="lp-h2" scope="global">
            <template #br><br /></template>
            <template #em><em class="lp-ember-deep lp-italic">{{ t('landing.operators.titleEm') }}</em></template>
          </i18n-t>
        </div>

        <div style="border-top: 1px solid var(--darwin-ink)">
          <div class="lp-ops-row lp-ops-header">
            <div v-for="h in ['class', 'domain', 'revenue', 'net', 'specimens', 'status']" :key="h" class="upper dim" style="font-size: 11px">{{ t(`landing.operators.headers.${h}`) }}</div>
          </div>
          <div
            v-for="(r, i) in OPERATORS"
            :key="r[0]"
            class="lp-ops-row lp-ops-data"
            :style="{ borderBottom: i < 5 ? '1px solid var(--darwin-border)' : 'none' }"
          >
            <div style="font-size: 22px; font-style: italic; font-weight: 400; letter-spacing: -0.01em">{{ t(`landing.operators.rows.${r[0]}.name`) }}</div>
            <div style="font-size: 15px; color: var(--darwin-ink-soft)">{{ t(`landing.operators.rows.${r[0]}.domain`) }}</div>
            <div class="mono lp-ops-num" :data-label="t('landing.operators.headers.revenue')">{{ r[1] }}</div>
            <div class="mono lp-ops-num" :data-label="t('landing.operators.headers.net')" :style="{ color: (r[2] ?? '').startsWith('+') ? '#1f8a3e' : 'var(--darwin-muted)' }">{{ r[2] }}</div>
            <div class="mono lp-ops-num" :data-label="t('landing.operators.headers.specimens')">{{ r[3] }}</div>
            <div>
              <span
                class="lp-status-badge mono"
                :style="{
                  color: r[4] === 'live' ? 'var(--darwin-bg)' : 'var(--darwin-ink)',
                  background: r[4] === 'live' ? 'var(--darwin-accent)' : r[4] === 'next' ? 'var(--darwin-bg-3)' : 'transparent',
                  border: r[4] === 'horizon' ? '1px solid var(--darwin-border)' : 'none',
                }"
              >{{ t(`landing.operators.status.${r[4]}`) }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════ CANVAS -->
    <section id="canvas" data-chapter="canvas" class="lp-section lab-dark">
      <div class="lp-container">
        <div class="upper lab-eyebrow">{{ t('landing.canvas.eyebrow') }}</div>
        <i18n-t keypath="landing.canvas.title" tag="h2" class="lp-h2 reveal" style="margin-bottom: 60px; max-width: 1100px" scope="global">
          <template #br><br /></template>
          <template #em><em style="color: var(--darwin-accent)">{{ t('landing.canvas.titleEm') }}</em></template>
        </i18n-t>

        <div class="lp-canvas-grid">
          <div>
            <p class="lab-lead" style="margin-bottom: 32px; max-width: 480px">{{ t('landing.canvas.lead') }}</p>
            <div style="display: flex; flex-direction: column; gap: 16px">
              <div
                v-for="k in ['timeline', 'replay', 'lineage']"
                :key="k"
                style="padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.16)"
              >
                <div style="font-size: 16px; font-weight: 500; margin-bottom: 4px">{{ t(`landing.canvas.features.${k}.title`) }}</div>
                <div style="font-size: 13px; color: rgba(243,238,226,0.6)">{{ t(`landing.canvas.features.${k}.body`) }}</div>
              </div>
            </div>
          </div>

          <div class="lp-feed-card mono">
            <div class="lp-feed-header">
              <span>{{ t('landing.canvas.feedTitle') }}</span>
              <span style="color: var(--darwin-accent)">● {{ t('landing.canvas.streaming') }}</span>
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
                  <span style="color: rgba(243,238,226,0.78)"> {{ t(`landing.activity.verbs.${ev.verb}`) }} </span>
                  <span style="color: var(--darwin-bg)">{{ ev.what && t(`landing.activity.items.${ev.what}`) }}</span>
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
            <div class="upper dim lab-eyebrow">{{ t('landing.roadmap.eyebrow') }}</div>
            <i18n-t keypath="landing.roadmap.title" tag="h2" class="lp-h2 reveal" scope="global">
              <template #br><br /></template>
              <template #em><em class="lp-ember-deep lp-italic">{{ t('landing.roadmap.titleEm') }}</em></template>
            </i18n-t>
          </div>
          <p class="lab-lead reveal">{{ t('landing.roadmap.lead') }}</p>
        </div>

        <div class="lp-roadmap-grid">
          <div
            v-for="(id, i) in PHASES"
            :key="id"
            class="lp-roadmap-col reveal"
            :style="{ borderInlineEnd: i < 3 ? '1px solid var(--darwin-border)' : 'none' }"
          >
            <div class="mono" style="font-size: 11px; color: var(--darwin-muted); margin-bottom: 8px">{{ t('landing.roadmap.phase', { n: i }) }}</div>
            <span
              class="lp-status-badge mono"
              :style="{
                marginBottom: '32px', display: 'inline-block',
                color: i === 0 ? 'var(--darwin-bg)' : 'var(--darwin-ink)',
                background: i === 0 ? 'var(--darwin-accent)' : i === 1 ? 'var(--darwin-bg-3)' : 'transparent',
                border: i > 1 ? '1px solid var(--darwin-border)' : 'none',
              }"
            >{{ t(`landing.roadmap.phases.${id}.status`) }}</span>
            <h3 style="font-size: 32px; font-weight: 400; letter-spacing: -0.02em; margin-bottom: 20px; font-style: italic">{{ t(`landing.roadmap.phases.${id}.title`) }}</h3>
            <p style="font-size: 15px; line-height: 1.55; color: var(--darwin-ink); margin-bottom: 16px">{{ t(`landing.roadmap.phases.${id}.body`) }}</p>
            <p class="mono" style="font-size: 11px; line-height: 1.7; color: var(--darwin-muted)">{{ t('landing.roadmap.doneWhen', { bar: t(`landing.roadmap.phases.${id}.bar`) }) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════ FAQ -->
    <section id="faq" data-chapter="faq" class="lp-section">
      <div class="lp-container">
        <div class="lab-head">
          <div>
            <div class="upper dim lab-eyebrow">{{ t('landing.faq.eyebrow') }}</div>
            <i18n-t keypath="landing.faq.title" tag="h2" class="lp-h2 reveal" scope="global">
              <template #em><em class="lp-ember-deep lp-italic">{{ t('landing.faq.titleEm') }}</em></template>
            </i18n-t>
          </div>
          <p class="lab-lead reveal">{{ t('landing.faq.lead') }}</p>
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
        <div class="upper lab-eyebrow">{{ t('landing.cta.eyebrow') }}</div>
        <i18n-t keypath="landing.cta.title" tag="h2" class="lp-cta-h2" scope="global">
          <template #br><br /></template>
          <template #em><em style="color: var(--darwin-accent)">{{ t('landing.cta.titleEm') }}</em></template>
        </i18n-t>

        <form class="lp-cta-form" @submit.prevent="submitCta">
          <input
            v-model="ctaEmail"
            type="email"
            placeholder="you@lab.org"
            :aria-label="t('landing.cta.emailLabel')"
            autocomplete="email"
            maxlength="254"
            :disabled="ctaSubmitted || ctaSending"
            required
            class="lp-cta-input"
          />
          <button type="submit" class="lp-btn lp-btn-ember" :disabled="ctaSubmitted || ctaSending">
            {{ ctaSubmitted ? t('landing.cta.onList') : ctaSending ? t('landing.cta.sending') : t('landing.hero.join') }}
          </button>
        </form>
        <p v-if="ctaError" role="alert" class="lp-cta-error">{{ t('landing.cta.error') }}</p>
        <p style="font-size: 13px; color: var(--darwin-muted-2); max-width: 560px">{{ t('landing.cta.note') }}</p>
      </div>

      <footer class="lp-container lp-footer">
        <div class="lp-footer-brand">
          <UiDarwinLogo :size="22" style="color: #f3eee2" />
          <i18n-t keypath="landing.footer.credit" tag="span" scope="global">
            <template #nexow><a href="https://nexow.studio" rel="noopener">Nexow Studio</a></template>
            <template #specimen><a href="https://specimenlabs.com" rel="noopener">Specimen Labs</a></template>
          </i18n-t>
        </div>
        <div class="lp-footer-links">
          <a href="#thesis">{{ t('lab.chapters.hero') }}</a>
          <a href="#trust">{{ t('lab.chapters.trust') }}</a>
          <a href="#faq">{{ t('lab.chapters.faq') }}</a>
          <a href="/llms.txt">llms.txt</a>
          <a href="mailto:security@darwinagents.com">{{ t('landing.footer.security') }}</a>
          <NuxtLink to="/login">{{ t('landing.nav.signIn') }}</NuxtLink>
          <UiLocaleSwitcher />
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
.lp-logo-tag { margin-inline-start: 8px; }
.lp-navlinks { display: flex; gap: 22px; font-size: 13px; white-space: nowrap; }
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
.lp-specs b { color: var(--darwin-ink); font-weight: 500; font-size: 13px; margin-inline-end: 4px; }
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
  display: grid; grid-template-columns: 180px 1fr; gap: 24px; width: 100%; text-align: start;
  padding: 18px 12px; border: none; border-bottom: 1px solid var(--darwin-border); background: transparent;
  color: var(--darwin-ink); cursor: pointer; transition: background 0.25s, padding 0.25s;
}
.th-row:hover, .th-row.is-active { background: var(--darwin-bg); padding-inline-start: 20px; }
.th-bio { font-size: 20px; font-style: italic; letter-spacing: -0.01em; }
.th-row.is-active .th-bio { color: var(--darwin-accent-deep); }
.th-darwin { font-size: 15px; line-height: 1.5; color: var(--darwin-ink-soft); }
.th-quote { margin-top: 80px; font-size: clamp(28px, 3.4vw, 48px); letter-spacing: -0.03em; text-align: center; font-style: italic; }

/* ── Anatomy ─────────────────────────────────────────────────────────────── */
.lp-anatomy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
.lp-anatomy-btn {
  display: grid; grid-template-columns: 64px 1fr; gap: 24px;
  width: 100%; text-align: start; padding: 28px 0;
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
.lp-ops-num { font-size: 14px; text-align: end; }
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
.lp-faq { border-top: 1px solid var(--darwin-ink); max-width: 1000px; margin-inline-start: auto; }
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
  .lp-ops-num { text-align: start; }
  .lp-ops-num::before {
    content: attr(data-label); display: block; margin-bottom: 4px;
    font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--darwin-muted);
  }
  .lp-section-header { grid-template-columns: 1fr; gap: 28px; margin-bottom: 56px; }
}
/* Below 1200px the chapter rail (≥ 900px) and the footer carry section navigation. */
@media (max-width: 1200px) {
  .lp-navlinks { display: none; }
}
@media (max-width: 720px) {
  .lp-logo-tag, .lp-btn-ghost-ink, .lp-nav-locale { display: none; }
  .lp-nav-cta { padding: 10px 16px; }
  .lp-hero-specimen { max-width: 240px; }
  .lp-callout { display: none; }
  .lp-meta-strip { grid-template-columns: 1fr; gap: 24px; }
  .th-row { grid-template-columns: 1fr; gap: 4px; }
  .lp-wiinot-grid, .lp-roadmap-grid { grid-template-columns: 1fr; }
  .lp-wiinot-col, .lp-roadmap-col { border-inline-end: none !important; border-bottom: 1px solid var(--darwin-border); }
  .lp-cta-form { flex-direction: column; }
  .lp-footer { flex-direction: column; align-items: flex-start; }
}
@media (prefers-reduced-motion: reduce) {
  .lp-scroll-cue, .lp-callout, .lp-pulse-dot, .lp-specimen-orbit-ring { animation: none; }
}
</style>
