<script setup lang="ts">
import type { Cell, Colony } from '~/utils/labSim'

// Natural selection you can poke: utils/labSim.ts runs the real rules ($1 floor,
// $25 profit to reproduce, child gets half the surplus); this draws it.
const { t } = useI18n()
const audio = useLabAudio()
const canvasRef = useTemplateRef<HTMLCanvasElement>('canvas')
const TICK = 0.125 // 8 market ticks per second

const pressure = ref(0.5)
const running = ref(true)
const stats = reactive({ alive: 0, births: 0, deaths: 0, topGen: 0, fitness: 0 })
const history = ref<number[]>([])
let colony: Colony

const sparkline = computed(() => {
  const h = history.value
  if (h.length < 2) return ''
  return h.map((v, i) => `${(i / (h.length - 1)) * 100},${28 - v * 26}`).join(' ')
})

function reset() {
  colony = createColony(window.innerWidth < 768 ? 30 : 60, 0)
  // Founders arrive with different budgets, so selection shows up within seconds.
  for (let i = 0; i < 14; i++) spawnCell(colony, { balance: 20 + Math.random() * 80 })
  history.value = []
}

function spawn() {
  if (colony.cells.filter((c) => !c.dead).length >= colony.cap) return
  spawnCell(colony, { balance: 100 })
  audio.blip(1.5)
}

function cellAt(e: MouseEvent): Cell | undefined {
  const canvas = canvasRef.value!
  const r = canvas.getBoundingClientRect()
  const x = ((e.clientX - r.left) / r.width) * 2 - 1
  const y = ((e.clientY - r.top) / r.height) * 2 - 1
  let best: Cell | undefined
  let bestD = 0.08
  for (const c of colony.cells) {
    if (c.dead) continue
    const d = Math.hypot(c.x - x, c.y - y)
    if (d < bestD) { best = c; bestD = d }
  }
  return best
}

function onClick(e: MouseEvent) {
  const c = cellAt(e)
  if (!c) return
  killCell(colony, c)
  audio.buzz()
}

onMounted(() => {
  const canvas = canvasRef.value!
  const ctx = canvas.getContext('2d')!
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) running.value = false
  reset()

  const bornAt = new Map<number, number>()
  let acc = 0
  let last = performance.now()
  let lastStats = 0
  let lastSample = 0

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = canvas.clientWidth * dpr
    canvas.height = canvas.clientHeight * dpr
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)

  function frame(now: number) {
    const dt = Math.min((now - last) / 1000, 0.1)
    last = now
    if (running.value) {
      acc += dt
      driftColony(colony, dt)
      while (acc >= TICK) {
        acc -= TICK
        const { born, died } = stepColony(colony, pressure.value)
        for (const b of born) bornAt.set(b.id, now)
        if (born.length) audio.tick(true)
        if (died.length) audio.tick(false)
      }
      // New owners keep arriving: never let the dish go empty.
      if (colony.cells.filter((c) => !c.dead).length < 2) for (let i = 0; i < 4; i++) spawnCell(colony)
    }
    draw(now)
    if (now - lastStats > 250) {
      lastStats = now
      const alive = colony.cells.filter((c) => !c.dead)
      stats.alive = alive.length
      stats.births = colony.births
      stats.deaths = colony.deaths
      stats.topGen = alive.reduce((m, c) => Math.max(m, c.gen), 0)
      stats.fitness = alive.length ? alive.reduce((s, c) => s + c.trait, 0) / alive.length : 0
      if (running.value && (!history.value.length || now - lastSample > 1000)) {
        lastSample = now
        history.value = [...history.value, stats.fitness].slice(-48)
      }
    }
  }

  function draw(now: number) {
    const w = canvas.width, h = canvas.height
    const R = Math.min(w, h) / 2
    ctx.clearRect(0, 0, w, h)
    // Dish: glass, rim and faint grid.
    const g = ctx.createRadialGradient(w / 2, h / 2, R * 0.1, w / 2, h / 2, R)
    g.addColorStop(0, 'rgba(255,91,31,0.07)')
    g.addColorStop(1, 'rgba(243,238,226,0.02)')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(w / 2, h / 2, R * 0.98, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = 'rgba(243,238,226,0.18)'
    ctx.lineWidth = Math.max(1, R * 0.006)
    ctx.stroke()
    ctx.strokeStyle = 'rgba(243,238,226,0.05)'
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.arc(w / 2, h / 2, (R * i) / 4, 0, Math.PI * 2); ctx.stroke() }

    for (const c of colony.cells) {
      const x = w / 2 + c.x * R
      const y = h / 2 + c.y * R
      const size = R * (0.018 + Math.sqrt(Math.max(c.balance, 0)) * 0.0028)
      if (c.dead) {
        ctx.fillStyle = `rgba(138,133,122,${Math.max(0, 0.5 - c.dead / 40)})`
        ctx.beginPath(); ctx.arc(x, y, size * (1 + c.dead / 30), 0, Math.PI * 2); ctx.fill()
        continue
      }
      // Trait colours the cell: grey (poor strategy) → ember (strong strategy).
      const t = c.trait
      const flicker = c.hungry ? 0.4 + 0.4 * Math.sin(now / 60) : 1
      ctx.fillStyle = `rgba(${138 + 117 * t},${133 - 42 * t},${122 - 91 * t},${0.85 * flicker})`
      ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = 'rgba(10,10,10,0.55)'
      ctx.beginPath(); ctx.arc(x, y, size * 0.32, 0, Math.PI * 2); ctx.fill()
      const born = bornAt.get(c.id)
      if (born !== undefined) {
        const k = (now - born) / 700
        if (k > 1) bornAt.delete(c.id)
        else {
          ctx.strokeStyle = `rgba(255,138,91,${1 - k})`
          ctx.lineWidth = R * 0.006
          ctx.beginPath(); ctx.arc(x, y, size * (1 + k * 2.5), 0, Math.PI * 2); ctx.stroke()
        }
      }
    }
  }

  const stop = useRenderLoop(canvas, frame)
  onUnmounted(() => { stop(); ro.disconnect() })
})
</script>

<template>
  <section id="selection" data-chapter="selection" class="lp-section lab-dark">
    <div class="lp-container">
      <div class="lab-head">
        <div>
          <div class="upper lab-eyebrow">{{ t('lab.petri.eyebrow') }}</div>
          <i18n-t keypath="lab.petri.title" tag="h2" class="lp-h2 reveal" scope="global">
            <template #em><em class="lp-ember">{{ t('lab.petri.titleEm') }}</em></template>
          </i18n-t>
        </div>
        <p class="lab-lead reveal">{{ t('lab.petri.lead') }}</p>
      </div>

      <div class="pd-grid">
        <div class="pd-dish-wrap">
          <canvas
            ref="canvas"
            class="pd-dish"
            role="img"
            :aria-label="t('lab.petri.dishLabel')"
            @click="onClick"
          />
        </div>

        <div class="pd-panel">
          <div class="pd-stats mono">
            <div><span class="dim">{{ t('lab.petri.stats.alive') }}</span><b>{{ stats.alive }}</b></div>
            <div><span class="dim">{{ t('lab.petri.stats.born') }}</span><b>{{ stats.births }}</b></div>
            <div><span class="dim">{{ t('lab.petri.stats.died') }}</span><b>{{ stats.deaths }}</b></div>
            <div><span class="dim">{{ t('lab.petri.stats.topGen') }}</span><b>{{ stats.topGen }}</b></div>
          </div>

          <div class="pd-fitness">
            <div class="mono dim pd-label">{{ t('lab.petri.meanQuality', { pct: Math.round(stats.fitness * 100) }) }}</div>
            <svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
              <polyline :points="sparkline" fill="none" stroke="#ff5b1f" stroke-width="1.2" vector-effect="non-scaling-stroke" />
            </svg>
          </div>

          <label class="pd-slider">
            <span class="mono dim pd-label">{{ t('lab.petri.pressure', { pct: Math.round(pressure * 100) }) }}</span>
            <input v-model.number="pressure" type="range" min="0" max="1" step="0.05">
          </label>

          <div class="pd-actions">
            <button type="button" class="lp-btn lp-btn-ember" @click="spawn">{{ t('lab.petri.spawn') }}</button>
            <button type="button" class="lp-btn-outline" @click="running = !running">{{ running ? t('lab.petri.pause') : t('lab.petri.run') }}</button>
            <button type="button" class="lp-btn-outline" @click="reset">{{ t('lab.petri.reset') }}</button>
          </div>

          <p class="mono pd-rules">{{ t('lab.petri.rules') }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pd-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 64px; align-items: center; }
.pd-dish-wrap { width: 100%; max-width: 620px; aspect-ratio: 1; margin: 0 auto; }
.pd-dish { width: 100%; height: 100%; cursor: crosshair; display: block; }
.pd-panel { display: flex; flex-direction: column; gap: 32px; }
.pd-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; }
.pd-stats div { display: flex; flex-direction: column; gap: 6px; padding-top: 12px; border-top: 1px solid rgba(243, 238, 226, 0.14); }
.pd-stats b { font-size: 32px; font-weight: 400; letter-spacing: -0.02em; color: var(--darwin-bg); }
.pd-label { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; display: block; margin-bottom: 10px; }
.pd-fitness svg { width: 100%; height: 56px; display: block; border-bottom: 1px solid rgba(243, 238, 226, 0.14); }
.pd-slider input { width: 100%; accent-color: var(--darwin-accent); }
.pd-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.pd-actions .lp-btn, .pd-actions .lp-btn-outline { padding: 14px 22px; }
.pd-rules { font-size: 11px; line-height: 1.7; color: rgba(243, 238, 226, 0.5); }
@media (max-width: 1024px) { .pd-grid { grid-template-columns: 1fr; gap: 40px; } }
</style>
