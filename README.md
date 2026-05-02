# darwin-frontend

Real-time canvas interface for Darwin Agents — a single-agent lifecycle visualizer and command console built on Nuxt 4, Vue 3, Pinia, and Supabase Realtime.

---

## What it is

The frontend has two purposes:

1. **Infinite Canvas** — a horizontally-scrolling, zoomable SVG timeline of every decision, tool call, financial event, neuron branch, and human intervention in an agent's life. Time runs left to right. Updates arrive in < 200 ms via Supabase Realtime WebSocket — zero polling.

2. **Command Console** — a slide-over panel for human-in-the-loop control: inject mid-lifecycle directives, top up budget, toggle autonomy mode, manage credentials, or hit the kill switch.

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
| Auth | `@nuxtjs/supabase` — magic links + Google OAuth |
| Icons | `lucide-vue-next` |
| Deployment | Vercel (Edge Functions for ISR, static for CSR canvas) |

---

## Project Structure

```
darwin-frontend/
├── app/                        # Vue application source (Nuxt 4 srcDir)
│   ├── app.vue                 # Root layout — auth guard + global error boundary
│   ├── assets/css/main.css     # Tailwind base + shared CSS classes
│   ├── components/
│   │   ├── canvas/             # Infinite Canvas components
│   │   │   ├── nodes/          # One component per event_type
│   │   │   ├── CanvasViewport.vue
│   │   │   ├── DarwinTrunk.vue
│   │   │   ├── NeuralThread.vue
│   │   │   ├── CanvasNode.vue
│   │   │   ├── BudgetGauge.vue
│   │   │   ├── HeartbeatBar.vue
│   │   │   ├── InterventionBanner.vue
│   │   │   ├── MentalReplayPanel.vue
│   │   │   ├── CanvasTopBar.vue
│   │   │   └── NodeShell.vue
│   │   ├── console/            # Command Console sub-components
│   │   │   ├── CommandConsole.vue
│   │   │   ├── CognitiveUplink.vue
│   │   │   ├── SecretsVault.vue
│   │   │   ├── MetabolicInjection.vue
│   │   │   ├── AutonomyToggle.vue
│   │   │   └── KillSwitch.vue
│   │   ├── panels/             # Right-side slide-over panels
│   │   │   ├── EntityPanel.vue
│   │   │   ├── SkillsPanel.vue
│   │   │   ├── LedgerPanel.vue
│   │   │   └── AssetsPanel.vue
│   │   ├── mobile/
│   │   │   └── MobileInterstitial.vue  # 2FA / CAPTCHA / approval relay
│   │   ├── spawn/
│   │   │   └── SpawnForm.vue           # 4-step agent creation form
│   │   └── ui/                 # Shared design system atoms
│   │       ├── DarwinButton.vue
│   │       ├── DarwinBadge.vue
│   │       ├── DarwinCard.vue
│   │       ├── DarwinModal.vue
│   │       └── DarwinToast.vue
│   ├── composables/
│   │   ├── useRealtimeCanvas.ts    # Supabase Realtime subscription + event routing
│   │   ├── useCanvasLayout.ts      # X-position math from timestamp_ms
│   │   ├── useVirtualScroll.ts     # Viewport-based node mount/unmount
│   │   ├── useCanvasPanels.ts      # Panel open/close state (useState)
│   │   ├── useApprovalFlow.ts      # Approve/deny handler
│   │   ├── useInterventionJWT.ts   # Decode resolve?token= for mobile
│   │   └── useApi.ts               # Auth-header wrapper around $fetch
│   ├── middleware/
│   │   └── auth.global.ts          # Redirect to /login if no session
│   ├── pages/
│   │   ├── index.vue               # Landing (ISR, 60s)
│   │   ├── login.vue               # Magic link + Google OAuth (ISR)
│   │   ├── dashboard.vue           # Agent list + P&L (CSR)
│   │   ├── spawn.vue               # New agent form (CSR)
│   │   ├── resolve.vue             # Mobile interstitial (CSR)
│   │   └── canvas/[id].vue         # Infinite Canvas (CSR, no SSR)
│   ├── stores/
│   │   ├── agent.ts                # useAgentStore — FSM state, balance, config
│   │   ├── canvas.ts               # useCanvasStore — events, neuron lanes, viewport
│   │   ├── notification.ts         # useNotificationStore — pending interventions
│   │   └── auth.ts                 # useAuthStore — Supabase session wrapper
│   ├── types/
│   │   ├── events.ts               # DarwinEvent + all payload interfaces
│   │   ├── agent.ts                # AgentState, DarwinAgent, API response shapes
│   │   ├── canvas.ts               # NeuronLane, CanvasLayout, TraceNode
│   │   ├── finance.ts              # VaultRef
│   │   └── database.types.ts       # Supabase table types stub
│   └── utils/
│       ├── eventColor.ts           # Node colour by event_type
│       ├── formatCost.ts           # "$0.042" formatting
│       ├── formatDuration.ts       # "8h 22m" + relative time
│       └── tokenRoi.ts             # Token ROI calculation
│
├── server/
│   └── routes/api/v1/[...path].ts  # Proxy → darwin-backend (never exposes Railway URL)
│
├── public/
├── nuxt.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
└── .env.example
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- A Supabase project with the `darwin_events` table and Realtime enabled
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
| `BACKEND_URL` | Internal URL for `darwin-backend` (server-side only, never sent to browser) |
| `APP_URL` | Public app URL for OAuth redirects |

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
| `/login` | ISR (60s) | No |
| `/resolve` | CSR | No (JWT-gated) |
| `/dashboard` | CSR | Yes |
| `/spawn` | CSR | Yes |
| `/canvas/[id]` | CSR | Yes |

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

All canvas updates arrive via push — zero polling. The canvas page fetches historical events on mount once, then subscribes to Realtime for live updates.

---

## Canvas Coordinate System

```
X = (event.timestamp_ms - genesis_timestamp_ms) / MS_PER_PX * zoomLevel
```

- `MS_PER_PX = 1000` at default zoom (1 second = 1 pixel)
- Trunk is fixed at `Y = 80`
- Each neuron lane offsets by `LANE_HEIGHT = 60px` below the trunk
- Hibernation gaps > 30 min are temporally compressed to 120px

---

## Deployment

Deploys to Vercel with zero configuration. The `nuxt build` output is auto-detected:
- ISR pages (`/`, `/login`) → Edge Functions
- CSR pages (`/dashboard`, `/canvas/**`) → static SPA shell

```bash
vercel deploy
```

Environment variables are set in the Vercel dashboard.

---

## Design System

Dark, high-contrast theme. Core Tailwind colour extensions:

| Token | Hex | Usage |
|---|---|---|
| `darwin-bg` | `#090c12` | Page background |
| `darwin-surface` | `#111827` | Card / panel surface |
| `darwin-border` | `#1f2937` | Subtle borders |
| `active` | `#8b5cf6` | Agent ACTIVE state, trunk glow |
| `hibernating` | `#475569` | Agent HIBERNATING state |
| `terminated` | `#7f1d1d` | Agent TERMINATED state |

Shared CSS classes (`darwin-btn-primary`, `darwin-input`, etc.) are defined in `app/assets/css/main.css`.
