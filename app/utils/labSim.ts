// Pure models behind the landing-page experiments. Numbers mirror darwin-agents:
// darwin_dna/hyperparameters.py, machinery/treasury_policy.py, evolution/reproduction.py.
// Framework-free on purpose so tests/labSim.test.ts can run it with plain `node --test`.

export const LAB_RULES = {
  capPerAction: 50,
  capPerDay: 500,
  capLifetime: 10_000,
  reviewThreshold: 5,
  minViableBalance: 1,
  reproduceProfit: 25,
  childShare: 0.5,
  anomalyFactor: 20,
  anomalyMinHistory: 5,
} as const

// ── Treasury gates ──────────────────────────────────────────────────────────

export type GateName = 'forbidden' | 'caps' | 'solvency' | 'envelope' | 'escalation' | 'anomaly'
export type Verdict = 'ALLOW' | 'ESCALATE' | 'REFUSE'
export const GATES: GateName[] = ['forbidden', 'caps', 'solvency', 'envelope', 'escalation', 'anomaly']

export interface PaymentRequest {
  amount: number
  balance: number
  category: string
  envelope: string[]
  spentToday?: number
  spentLifetime?: number
  sanctioned?: boolean
  paysHuman?: boolean
  recentMax?: number
  history?: number
}

export type ReasonId =
  | 'clear' | 'sanctioned' | 'overActionCap' | 'overDailyCap' | 'overLifetimeCap'
  | 'belowFloor' | 'outsideEnvelope' | 'paysHuman' | 'aboveReview' | 'anomaly'

export interface GateStep {
  gate: GateName
  result: 'PASS' | Verdict
  reason: ReasonId
  params?: Record<string, string | number>
}

/** First gate that fires decides, exactly like treasury_policy.evaluate(). */
export function evaluatePayment(p: PaymentRequest): { verdict: Verdict; trail: GateStep[] } {
  const R = LAB_RULES
  const checks: [GateName, () => [Verdict, ReasonId, GateStep['params']?] | null][] = [
    ['forbidden', () => (p.sanctioned ? ['REFUSE', 'sanctioned'] : null)],
    ['caps', () => {
      if (p.amount > R.capPerAction) return ['REFUSE', 'overActionCap', { cap: R.capPerAction }]
      if ((p.spentToday ?? 0) + p.amount > R.capPerDay) return ['REFUSE', 'overDailyCap', { cap: R.capPerDay }]
      if ((p.spentLifetime ?? 0) + p.amount > R.capLifetime) return ['REFUSE', 'overLifetimeCap']
      return null
    }],
    ['solvency', () => (p.balance - p.amount < R.minViableBalance
      ? ['REFUSE', 'belowFloor', { floor: R.minViableBalance }]
      : null)],
    ['envelope', () => (p.envelope.includes(p.category) ? null : ['REFUSE', 'outsideEnvelope', { category: p.category }])],
    ['escalation', () => {
      if (p.paysHuman) return ['ESCALATE', 'paysHuman']
      if (p.amount > R.reviewThreshold) return ['ESCALATE', 'aboveReview', { threshold: R.reviewThreshold }]
      return null
    }],
    ['anomaly', () => {
      const max = p.recentMax ?? 0
      if ((p.history ?? 0) >= R.anomalyMinHistory && p.amount >= 1 && max > 0 && p.amount > max * R.anomalyFactor)
        return ['ESCALATE', 'anomaly', { factor: Math.round(p.amount / max) }]
      return null
    }],
  ]
  const trail: GateStep[] = []
  for (const [gate, check] of checks) {
    const hit = check()
    if (hit) {
      trail.push({ gate, result: hit[0], reason: hit[1], params: hit[2] })
      return { verdict: hit[0], trail }
    }
    trail.push({ gate, result: 'PASS', reason: 'clear' })
  }
  return { verdict: 'ALLOW', trail }
}

// ── Petri dish colony ───────────────────────────────────────────────────────

export interface Cell {
  id: number
  x: number // unit disc coordinates, |(x,y)| < 1
  y: number
  vx: number
  vy: number
  balance: number
  profit: number // since last reproduction
  trait: number // 0..1 strategy quality, inherited with mutation
  gen: number
  hungry: number // ticks spent below the minimum viable balance
  dead: number // 0 = alive, >0 = ticks since death (for fade-out)
}

export interface Colony {
  cells: Cell[]
  nextId: number
  births: number
  deaths: number
  cap: number
}

export const GRACE_TICKS = 6

export function createColony(cap: number, seed: number, rand: () => number = Math.random): Colony {
  const c: Colony = { cells: [], nextId: 1, births: 0, deaths: 0, cap }
  for (let i = 0; i < seed; i++) spawnCell(c, { rand })
  return c
}

export function spawnCell(
  c: Colony,
  o: { balance?: number; trait?: number; gen?: number; x?: number; y?: number; rand?: () => number } = {},
): Cell {
  const rand = o.rand ?? Math.random
  const a = rand() * Math.PI * 2
  const r = Math.sqrt(rand()) * 0.8
  const cell: Cell = {
    id: c.nextId++,
    x: o.x ?? Math.cos(a) * r,
    y: o.y ?? Math.sin(a) * r,
    vx: 0,
    vy: 0,
    balance: o.balance ?? 100,
    profit: 0,
    trait: o.trait ?? 0.2 + rand() * 0.8,
    gen: o.gen ?? 0,
    hungry: 0,
    dead: 0,
  }
  c.cells.push(cell)
  return cell
}

/** Kill switch: no grace, no resurrection. */
export function killCell(c: Colony, cell: Cell) {
  if (cell.dead) return
  cell.dead = 1
  c.deaths++
}

/**
 * One market tick. `pressure` (0..1) raises metabolic cost.
 * Revenue scales with the inherited trait, so selection pushes the mean trait up.
 */
export function stepColony(c: Colony, pressure: number, rand: () => number = Math.random) {
  const R = LAB_RULES
  const born: Cell[] = []
  const died: Cell[] = []
  const cost = 1.5 + pressure * 2
  const alive = c.cells.filter((x) => !x.dead).length

  // Snapshot: newborns start trading next tick.
  for (const cell of c.cells.slice()) {
    if (cell.dead) { cell.dead++; continue }
    const net = cell.trait * 4.5 * (0.5 + rand()) - cost
    cell.balance += net
    cell.profit += net

    if (cell.balance < R.minViableBalance) {
      cell.hungry++
      if (cell.hungry > GRACE_TICKS) { cell.dead = 1; c.deaths++; died.push(cell) }
      continue
    }
    cell.hungry = 0

    const surplus = cell.balance - R.minViableBalance
    if (cell.profit >= R.reproduceProfit && surplus > R.reproduceProfit && alive + born.length < c.cap) {
      const gift = surplus * R.childShare
      cell.balance -= gift
      cell.profit = 0
      const mutation = (rand() + rand() + rand() - 1.5) * 0.12
      born.push(spawnCell(c, {
        balance: gift,
        trait: Math.min(1, Math.max(0, cell.trait + mutation)),
        gen: cell.gen + 1,
        x: cell.x + (rand() - 0.5) * 0.08,
        y: cell.y + (rand() - 0.5) * 0.08,
        rand,
      }))
      c.births++
    }
  }
  // Drop corpses once they have faded.
  c.cells = c.cells.filter((x) => x.dead < 20)
  return { born, died }
}

/** Brownian drift inside the dish; called every animation frame. */
export function driftColony(c: Colony, dt: number, rand: () => number = Math.random) {
  for (const cell of c.cells) {
    if (cell.dead) continue
    cell.vx = cell.vx * 0.92 + (rand() - 0.5) * 0.02
    cell.vy = cell.vy * 0.92 + (rand() - 0.5) * 0.02
    cell.x += cell.vx * dt * 6
    cell.y += cell.vy * dt * 6
    const d = Math.hypot(cell.x, cell.y)
    if (d > 0.9) { cell.x *= 0.9 / d; cell.y *= 0.9 / d; cell.vx *= -0.5; cell.vy *= -0.5 }
  }
}
