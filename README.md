# darwin-frontend

Real-time canvas interface for Darwin Agents — a single-agent lifecycle visualizer and command console built on Nuxt 4, Vue 3, Pinia, and Supabase Realtime.

---

## What it is

The frontend has three parts:

1. **Landing page** (`/`) — the public marketing site, with a waitlist form that writes to a Supabase `waitlist` table.

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
| Landing visuals | `three` (WebGL scenes, paused when off-screen) |
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
│   │   ├── landing/              # Three.js scenes: DnaHelix, MoleculeCloud, AnatomyOrganScene
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
│   └── utils/formatDuration.ts   # formatRelativeTime
├── server/routes/api/v1/[...path].ts  # Proxy → darwin-backend (BACKEND_URL stays server-side)
├── supabase/migrations/          # SQL for tables this app owns (waitlist)
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
