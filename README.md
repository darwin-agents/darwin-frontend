# darwin-frontend

Real-time canvas interface for Darwin Agents — a single-agent lifecycle visualizer and command console built on Nuxt 4, Vue 3, Pinia, and Supabase Realtime.

---

## What it is

The frontend has three parts:

1. **Landing page** (`/`) — an immersive "observation lab" for the public site: a living WebGL specimen that follows the visitor through 13 scroll chapters explaining the real `darwin-agents` technology (genome, soma, 13 neurons, treasury gates, evolution, kill switch, audit chain), with interactive experiments, synthesized lab sound, and a waitlist form that writes to a Supabase `waitlist` table. See [Landing lab](#landing-lab).

2. **Infinite Canvas** — a horizontally-scrolling, zoomable SVG timeline of every decision, tool call, financial event, neuron branch, and human intervention in an agent's life. Time runs left to right. Updates arrive in < 200 ms via Supabase Realtime WebSocket — zero polling.

3. **Command Console** — a slide-over panel for human-in-the-loop control: inject mid-lifecycle directives, top up budget, toggle autonomy mode, manage credentials, or hit the kill switch.

The frontend never talks to Modal or the agent directly. It only talks to `darwin-backend` over HTTPS and receives live events from Supabase Realtime.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Nuxt 4 (Nuxt 4 `app/` directory layout) |
| UI | Vue 3 Composition API |
| State | Pinia |
| Styling | TailwindCSS v3 |
| Real-time | Supabase Realtime (`postgres_changes` on `darwin_events`) |
| Canvas | Native SVG + CSS transforms |
| HTTP client | `$fetch` (Nuxt built-in) |
| Auth | `@nuxtjs/supabase` — email + password, Google OAuth, password reset |
| Icons | `lucide-vue-next` |
| Landing visuals | `three` (one fixed shader organism + 2 scenes, paused off-screen), Canvas2D, Web Audio, CSS scroll-driven animations |
| Deployment | Vercel (Nitro: Node functions + ISR for `/` and `/login`) |

---

## Project Structure

```
darwin-frontend/
├── app/                          # Vue application source (Nuxt 4 srcDir)
│   ├── app.vue                   # <NuxtPage /> + global toast host
│   ├── assets/css/main.css       # Design tokens, Tailwind layers, shared classes
│   ├── components/
│   │   ├── canvas/               # Infinite Canvas: viewport, trunk, neural lanes,
│   │   │   │                     # time ruler, top bar, budget/heartbeat, replay panel
│   │   │   └── nodes/            # One component per event family
│   │   ├── console/              # Command Console sections (uplink, vault, budget,
│   │   │                         # autonomy, kill switch)
│   │   ├── landing/              # Lab chapters + 3D: SpecimenOrganism, LabGate, LabHud, LabTelemetry,
│   │   │                         # LabNotes, LifecycleChapter, PetriDish, NeuronConstellation,
│   │   │                         # TreasuryGates, EvolutionLab, TrustLab, AnatomyOrganScene
│   │   ├── mobile/               # MobileInterstitial (2FA / CAPTCHA / approval relay)
│   │   ├── panels/               # Entity, Skills, Ledger, Assets slide-overs
│   │   ├── spawn/                # SpawnForm (4-step wizard)
│   │   └── ui/                   # DarwinModal, DarwinToast
│   ├── composables/
│   │   ├── useApi.ts             # Auth-header wrapper around $fetch → /api/v1
│   │   ├── useRealtimeCanvas.ts  # Supabase Realtime subscription + event routing
│   │   ├── useCanvasLayout.ts    # X-position math from timestamp_ms
│   │   ├── useCanvasPanels.ts    # Mutually exclusive slide-over state
│   │   ├── useVirtualScroll.ts   # Viewport-based node mount/unmount
│   │   ├── useApprovalFlow.ts    # Approve / deny for APPROVAL_REQUESTED
│   │   ├── useInterventionJWT.ts # Decode resolve?token= (base64url)
│   │   ├── useRenderLoop.ts      # Visibility-aware WebGL render loop
│   │   ├── useLabChapter.ts      # Active landing chapter + specimen config per chapter
│   │   ├── useLabAudio.ts        # Synthesized lab sound (Web Audio, opt-in)
│   │   └── useToast.ts           # Push toasts to <UiDarwinToast />
│   ├── pages/
│   │   ├── index.vue             # Landing + waitlist (ISR, 60s)
│   │   ├── login.vue             # Sign in / sign up / forgot password (ISR)
│   │   ├── confirm.vue           # OAuth + email-confirmation landing → /dashboard
│   │   ├── reset-password.vue    # Supabase recovery link target
│   │   ├── dashboard.vue         # Agent list
│   │   ├── spawn.vue             # New agent wizard
│   │   ├── resolve.vue           # Mobile interstitial (JWT-gated)
│   │   └── canvas/[id].vue       # Infinite Canvas
│   ├── stores/                   # agent, canvas, notification, auth (Pinia)
│   ├── types/                    # events, agent, canvas, database.types (Supabase)
│   └── utils/                    # formatDuration (formatRelativeTime), labSim (treasury gates + colony model)
├── server/routes/api/v1/[...path].ts  # Proxy → darwin-backend (BACKEND_URL stays server-side)
├── supabase/migrations/          # SQL for tables this app owns (waitlist)
├── tests/labSim.test.ts          # node --test tests/labSim.test.ts
├── nuxt.config.ts
├── tailwind.config.ts
└── vercel.json
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- A Supabase project with the `darwin_events` table and Realtime enabled
- The `waitlist` table from `supabase/migrations/` applied (`supabase db push`, or paste the SQL into the SQL editor)
- A running `darwin-backend` instance

### Install

```bash
pnpm install
```

### Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (browser-safe; RLS enforces access) |
| `BACKEND_URL` | Internal URL for `darwin-backend` (server-side only, never sent to browser). Read at build time; override at runtime with `NUXT_BACKEND_URL` |

Without `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` every SSR page fails with a 500.

In the Supabase dashboard (**Authentication → URL configuration**), add `/confirm` and `/reset-password` for each environment to **Redirect URLs** (for example `http://localhost:3000/confirm`, `http://localhost:3000/reset-password`, and the same paths on your production origin). Google sign-in and sign-up confirmation emails land on `/confirm`; password-reset emails land on `/reset-password`.

### Development

```bash
pnpm dev
```

Opens at `http://localhost:3000`.

### Production build

```bash
pnpm build
pnpm preview       # preview the .output/server locally
```

---

## Routing

| Route | Rendering | Auth required |
|---|---|---|
| `/` | ISR (60s) | No |
| `/login` | ISR (60s) | No (signed-in users are sent to `/dashboard`) |
| `/confirm` | CSR | No (auth callback) |
| `/reset-password` | CSR | No (recovery link) |
| `/resolve` | CSR | No (JWT-gated) |
| `/dashboard` | CSR | Yes |
| `/spawn` | CSR | Yes |
| `/canvas/[id]` | CSR | Yes |

Auth is enforced by `@nuxtjs/supabase`'s redirect middleware (`supabase.redirectOptions` in `nuxt.config.ts`): every route not listed in `exclude` (or as `login` / `callback`) redirects to `/login` without a session.

---

## Real-time Architecture

```
darwin-agent (Modal)
  → POST /telemetry/stream-event
  → darwin-backend inserts row into darwin_events
  → Supabase Realtime broadcasts INSERT to all channel subscribers
  → useRealtimeCanvas routes the event:
      canvas.appendEvent(event)          → canvas timeline updates
      agent.handleLifecycleEvent(event)  → FSM state + budget gauge
      notifications.add(event)           → amber intervention banners
```

All canvas updates arrive via push — zero polling. On mount the canvas page subscribes to Realtime first, then fetches history once and replays it through the same router (agent state excluded, since `fetchAgent` already has it), so pending approvals from history still show banners. Events are de-duplicated by `id`.

---

## Canvas Coordinate System

```
X = CANVAS_ORIGIN_PAD_X + (event.timestamp_ms - genesis_timestamp_ms) / MS_PER_PX * zoomLevel
```

- `genesis_timestamp_ms` is the earliest event timestamp; `CANVAS_ORIGIN_PAD_X = 64`

- `MS_PER_PX = 1000` at default zoom (1 second = 1 pixel)
- Trunk is fixed at `Y = 80`
- Each neuron lane offsets by `LANE_HEIGHT = 60px` below the trunk

---

## Deployment

Deploys to Vercel with zero configuration. The `nuxt build` output is auto-detected:
- ISR pages (`/`, `/login`) → Node functions with 60s revalidation
- CSR pages (`/dashboard`, `/spawn`, `/canvas/**`, `/confirm`, `/resolve`, `/reset-password`) → SPA shell
- `/api/v1/**` → Node function proxying to `BACKEND_URL`

```bash
vercel deploy
```

Environment variables are set in the Vercel dashboard.

---

## Landing lab

`/` is built as a guided observation of one specimen. Facts come from `darwin-agents` (`docs/overview`, `docs/engineering`, `src/darwin_dna`); plain-language copy on the surface, real tech and numbers in each chapter's **Lab notes**.

| # | Chapter | Component | Interaction |
|---|---|---|---|
| — | Airlock | `LabGate` | First visit only (inline head script adds `html.lab-gate-open` before paint); enter with sound or silently |
| 00 | Hero | `pages/index.vue` | Specimen in its slot, annotated |
| 01 | Thesis | `pages/index.vue` | Biology ↔ Darwin map; hovering a row morphs the specimen |
| 02 | Anatomy | `pages/index.vue` + `AnatomyOrganScene` | DNA core, soma, neurons, treasury, lineage |
| 03 | Lifecycle | `LifecycleChapter` | Sticky; scroll scrubs birth → heartbeat → metabolism → escalation → reproduction → death around the 9 real graph nodes |
| 04 | Selection | `PetriDish` | Live colony on the real rules (`utils/labSim.ts`); spawn, kill, market pressure |
| 05 | Neurons | `NeuronConstellation` | The 13 registered neurons and their capability tags |
| 06 | Treasury | `TreasuryGates` | Send sample payments through the 6 checks of `treasury_policy` |
| 07 | Evolution | `EvolutionLab` | Mutation pipeline, accepted vs rejected patch, frozen fitness weights, lesson layers, and the specimen as a growing lineage colony |
| 08 | Trust | `TrustLab` | Guarded kill switch; SHA-256 audit chain hashed in the browser that you can tamper with |
| 09–13 | Boundaries, operators, canvas, roadmap, waitlist | `pages/index.vue` | Real Phase 0–3 roadmap; waitlist form |

How it fits together:

- **One organism.** `SpecimenOrganism` is a single fixed WebGL canvas (`z-index: 1`) between section backgrounds and section content (`.lp-container` is `z-index: 2`; sections must not create stacking contexts). It lerps toward `CHAPTERS[active]` in `composables/useLabChapter.ts`; a chapter can pin it to an element with `data-specimen-anchor` (`data-specimen-fill` = diameter / element width). It hides itself — and skips rendering — in chapters with `presence: 0`. Its `split` parameter grows a lineage colony: the mother (with the 13 neurons) stays at the root while children bud around her and the strongest bud a next generation, linked by lineage threads (lifecycle reproduction stage, evolution chapter, thesis rows).
- **Chapters.** Sections carry `data-chapter="<id>"`; `observeChapters()` tracks the one under the viewport's centre line. Reveals are pure CSS (`.reveal`, `animation-timeline: view()`).
- **Sound.** `useLabAudio` synthesizes everything (drone, heartbeat, blips, flatline) — no audio files, nothing plays before an explicit opt-in, suspended when the tab is hidden.
- **Accessibility & performance.** All experiments are real buttons/inputs; canvases are `aria-hidden` with text equivalents. Under `prefers-reduced-motion` nothing loops (verified: 0 rAF/s). At most 2 WebGL contexts, paused off-screen via `useRenderLoop`.
- **Data on the page.** The ledger ticker, network stats and operator classes are illustrative. Everything else (caps, gates, neurons, fitness, reproduction, roadmap) matches the code; contested doc values use what the code enforces (20 % fee on withdrawn profit only, kill ≤ 5 s, parent survives reproduction).

---

## SEO, GEO & PWA

- **Head & social.** `nuxt.config.ts` sets icons, manifest, theme colour and default Open Graph/Twitter tags (`/og.png`, 1200×630); `app.vue` adds the title template, canonical URL and `og:url` from `runtimeConfig.public.siteUrl` (`NUXT_PUBLIC_SITE_URL`, default `https://darwinagents.com`).
- **Indexing.** `/` is the only indexable page (`public/sitemap.xml`). App routes send `X-Robots-Tag: noindex, nofollow` via `routeRules` and are disallowed in `public/robots.txt`.
- **Structured data.** The landing page emits JSON-LD: both organizations (Nexow, Inc.; Specimen Labs, Inc.), `WebSite`, `SoftwareApplication`, and a `FAQPage` generated from the same `FAQ` array as the visible FAQ chapter (from `darwin-agents/docs/marketing/08-faq.md`).
- **GEO (generative engine optimization).** `public/llms.txt` is a plain-markdown fact sheet for AI answer engines, linked from `<head>` and the footer; content is server-rendered, so crawlers that don't run JS see everything (the airlock gate only exists with JS). Keep its numbers in sync with the page.
- **PWA.** `public/site.webmanifest` (standalone, maskable icons) + a minimal `public/sw.js` (registered in `plugins/pwa.client.ts`, production only) that makes the app installable and serves `public/offline.html` when a navigation fails; it caches nothing else. `<UiInstallButton>` (landing nav, dashboard) uses the native install prompt where supported and shows "Share → Add to Home Screen" on iOS. Bump `CACHE` in `sw.js` when `offline.html` changes.
- **Icons** are generated (ink disc, cream ring, ember nucleus): `favicon.svg`, `favicon.ico` (16/32/48), `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`.

---

## Design System

Warm "paper" theme: sand surfaces, ink text, ember accent. Tokens live as CSS variables in `app/assets/css/main.css` and as Tailwind colours under `darwin.*` in `tailwind.config.ts`:

| Token | Value | Usage |
|---|---|---|
| `darwin-bg` | `#f3eee2` | Page background |
| `darwin-surface` / `darwin-bg-2` | `#e9e2cf` | Cards, panels, top bar |
| `darwin-bg-3` | `#ddd4bd` | Hover / inactive fills |
| `darwin-ink` | `#0a0a0a` | Primary text |
| `darwin-ink-soft` | `#3d3a32` | Secondary text |
| `darwin-muted` | `#8a857a` | Labels, meta |
| `darwin-border` / `darwin-border-soft` | `rgba(10,10,10,.12)` / `.06` | Borders, dividers |
| `darwin-accent` | `#ff5b1f` | Ember accent, ACTIVE state |
| `darwin-accent-deep` | `#c93f0a` | Accent text on sand |

Shared CSS classes (`darwin-btn-primary`, `darwin-input`, etc.) are defined in `app/assets/css/main.css`.
