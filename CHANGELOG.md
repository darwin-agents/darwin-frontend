# Changelog

All notable changes to `darwin-frontend` are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.2.0] — 2026-05-02

### Added

**Nuxt 4 directory layout migration**
- Moved all Vue app source (`app.vue`, `assets/`, `components/`, `composables/`, `middleware/`, `pages/`, `stores/`, `types/`, `utils/`) into the `app/` srcDir per [Nuxt 4 conventions](https://nuxt.com/docs/4.x/directory-structure)
- `server/` stays at project root (Nitro is separate from the Vue app)
- Updated `tailwind.config.ts` content paths to `./app/**/*`
- Added `stores` to `imports.dirs` in `nuxt.config.ts` for Pinia auto-import

**Missing spec components implemented**
- `components/ui/DarwinButton.vue` — generic button atom wrapping all variant classes
- `components/ui/DarwinBadge.vue` — colour-coded badge for agent states and skill labels
- `components/ui/DarwinCard.vue` — standard surface card wrapper
- `components/ui/DarwinToast.vue` — bottom-right toast notification system with `useState`-backed queue
- `composables/useApprovalFlow.ts` — approve / deny handler that calls `PATCH /darwins/{id}/config`
- `types/database.types.ts` — Supabase typed client stub (`darwin_events` table schema); replace with `supabase gen types typescript` output
- `vercel.json` — Vercel deployment config (`nuxt build`, `.output/public`)
- `.env.example` — documented environment variables

**TypeScript fixes**
- Refactored `useCanvasPanels` to expose explicit `toggle*` / `close*` methods, eliminating `boolean → Ref<boolean>` assignment errors in all panel and console templates
- Removed non-existent `session.value.user` access in `stores/auth.ts` (`@nuxtjs/supabase` v2 strips `.user` from the session object; use `useSupabaseUser()` instead)
- Added undefined-guard for `neuronLanes[event.neuron_id]` access in `stores/canvas.ts`
- Added `tailwindcss@^3` as a dev dependency for the `Config` type import in `tailwind.config.ts`

---

## [0.1.0] — 2026-05-01

### Added

**Full Phase 1 MVP scaffold**

_Routing & pages_
- `pages/index.vue` — public landing page (ISR, 60s revalidation)
- `pages/login.vue` — passwordless auth: magic link + Google OAuth
- `pages/dashboard.vue` — agent list with FSM state badges, budget gauges, and canvas links
- `pages/spawn.vue` — 4-step agent creation wizard (identity → budget → tools → review)
- `pages/canvas/[id].vue` — Infinite Canvas (pure CSR); loads history on mount, subscribes to Realtime, unsubscribes on unmount
- `pages/resolve.vue` — mobile interstitial for Telegram deep-link JWT flows

_Pinia stores_
- `stores/agent.ts` — FSM state, live balance, burn rate, `fetchAgent`, `postUplink`, `patchConfig`, `terminate`
- `stores/canvas.ts` — ordered event list, neuron lane map, scroll/zoom state, heartbeat samples, deduplication
- `stores/notification.ts` — pending intervention queue; resolve-by-type correlation
- `stores/auth.ts` — thin wrapper around `useSupabaseClient` / `useSupabaseUser` / `useSupabaseSession`

_Canvas_
- `CanvasViewport` — pan (mouse drag) + zoom (scroll wheel), virtual SVG coordinate space
- `DarwinTrunk` — horizontal trunk line with animated metabolic state classes (`trunk-active`, `trunk-hibernating`, `trunk-terminated`)
- `NeuralThread` — branching lane with cubic bezier connectors at branch and merge points
- `CanvasNode` — generic dispatcher that maps `event_type → specialised node component`
- `NodeShell` — base SVG anatomy (circle, label, cost badge) shared by all node types
- 12 specialised node components: `GenesisNode`, `ThoughtNode`, `ToolNode`, `FinancialNode`, `SkillNode`, `EntityNode`, `MemoryNode`, `InterventionNode`, `HibernateNode`, `WakeNode`, `SynapticNode`, `TerminatedNode`
- `BudgetGauge` — animated horizontal progress bar (green → amber → red as balance depletes)
- `HeartbeatBar` — live mini-sparkline of `tokens_burned_last_30s` (last 10 samples)
- `InterventionBanner` — amber sticky banner strip for pending human interventions
- `MentalReplayPanel` — 640px slide-over; EYES column (screenshot / content) + MIND column (thought trace from `GET /darwins/{id}/logs`); lazy-fetched on node click
- `CanvasTopBar` — agent name, FSM badge, budget gauge, heartbeat, panel toggle buttons

_Command Console_
- `CommandConsole` — right-side slide-over with five collapsible sections
- `CognitiveUplink` — mid-lifecycle directive injection → `POST /darwins/{id}/uplink`
- `SecretsVault` — VCC + API key submission; raw digits cleared immediately after POST; only masked references stored in component state
- `MetabolicInjection` — budget top-up → `PATCH /darwins/{id}/config`
- `AutonomyToggle` — enable/disable `requires_approval` gate
- `KillSwitch` — termination with confirmation modal

_Side panels_
- `EntityPanel` — entity map derived from `ENTITY_CREATED` / `ENTITY_UPDATED` events; grouped by `entity_type`; expandable JSON view
- `SkillsPanel` — skill documents from `SKILL_CREATED` events; markdown content preview
- `LedgerPanel` — full transaction history; revenue / burned summary
- `AssetsPanel` — placeholder for uploaded file assets

_Mobile interstitial_
- `MobileInterstitial` — three variants rendered by `pages/resolve.vue`:
  - `2fa` — numeric code input with countdown timer
  - `captcha` — full-screen iframe relay to live Browserbase session
  - `approval` — amount + justification display with Approve / Deny buttons

_Shared UI_
- `DarwinModal` — Teleport-based modal with backdrop, header, body, and footer slots

_Composables_
- `useRealtimeCanvas` — Supabase `postgres_changes` subscription; routes events to canvas / agent / notification stores
- `useCanvasLayout` — `timestampToX()`, total canvas dimensions, lane geometry
- `useVirtualScroll` — filters events to visible viewport ± 200px buffer; reactive to window resize
- `useCanvasPanels` — `useState`-backed open/close state for all side panels
- `useInterventionJWT` — base64-decode `resolve?token=` JWT without verification (server verifies on submit)
- `useApi` — auth-header wrapper around `$fetch`; all backend calls use `/api/v1/*` prefix (proxied server-side)

_Server_
- `server/routes/api/v1/[...path].ts` — transparent proxy to `darwin-backend`; keeps the Railway URL server-side only

_Types_
- `types/events.ts` — `DarwinEvent` interface + all payload shapes (`ThoughtPayload`, `ToolResultPayload`, `LedgerPayload`, `NeuronSpawnedPayload`, `SynapticIntegrationPayload`, `AskHumanPayload`, `ApprovalPayload`, `EntityPayload`)
- `types/agent.ts` — `AgentState`, `DarwinAgent`, `AgentStateApi`, `SpawnAgentBody`, `SpawnAgentResponse`
- `types/canvas.ts` — `NeuronLane`, `CanvasLayout`, `TraceNode`
- `types/finance.ts` — `VaultRef`

_Utils_
- `utils/eventColor.ts` — Tailwind class + hex accent colour per `event_type`
- `utils/formatCost.ts` — `$0.042` formatting
- `utils/formatDuration.ts` — `8h 22m` + relative time
- `utils/tokenRoi.ts` — token ROI stub

_Config_
- `nuxt.config.ts` — route rules (ISR for public, CSR for canvas), `@pinia/nuxt`, `@nuxtjs/supabase`, `@nuxtjs/tailwindcss`, backend proxy runtime config, Supabase typed client
- `tailwind.config.ts` — `darwin-*` colour tokens, metabolic state colours, `pulse-glow` keyframe, JetBrains Mono font
- `assets/css/main.css` — Tailwind base + `darwin-btn-*`, `darwin-input`, trunk state SVG classes, lane line classes, `slide-right` transition
- `middleware/auth.global.ts` — global auth guard; redirects unauthenticated users to `/login`

---

[Unreleased]: https://github.com/darwin-agents/darwin-frontend/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/darwin-agents/darwin-frontend/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/darwin-agents/darwin-frontend/releases/tag/v0.1.0
