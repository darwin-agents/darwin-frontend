<script setup lang="ts">
// Fixed lab instrumentation: chapter rail (right) and specimen telemetry (bottom-left).
const { active, stage, killed } = useLabChapter()
const vitals = useState('lab-vitals', () => ({ bpm: 63, alive: true }))
const chapters = CHAPTER_IDS.filter((id) => id !== 'hero')

const STAGE_BALANCE = [100, 99.62, 131.4, 131.4, 78.2, 0.84]
const balance = computed(() => {
  if (killed.value) return 0
  if (active.value === 'lifecycle') return STAGE_BALANCE[stage.value] ?? 100
  return 142.18
})
const status = computed(() => {
  if (killed.value) return 'Halted'
  if (active.value === 'lifecycle') return LIFECYCLE_STAGES[stage.value]
  return 'Foraging'
})
</script>

<template>
  <nav class="lab-rail" aria-label="Chapters">
    <a
      v-for="(id, i) in chapters"
      :key="id"
      :href="`#${id}`"
      class="lab-rail-item"
      :class="{ 'is-active': active === id, 'is-dark': CHAPTERS[active].dark }"
      :aria-current="active === id ? 'true' : undefined"
    >
      <span class="lab-rail-label">{{ CHAPTERS[id].label }}</span>
      <span class="lab-rail-num">{{ String(i + 1).padStart(2, '0') }}</span>
    </a>
  </nav>

  <div class="lab-telemetry" :class="{ 'is-dark': CHAPTERS[active].dark }" aria-hidden="true">
    <div class="lab-telemetry-head">
      <span class="lab-telemetry-dot" :class="{ 'is-dead': !vitals.alive }" />
      Specimen DRW-0847 · simulated
    </div>
    <div class="lab-telemetry-grid">
      <span>State</span><span>{{ status }}</span>
      <span>Heart</span><span>{{ vitals.alive ? `${vitals.bpm} bpm` : 'flatline' }}</span>
      <span>Treasury</span><span>${{ balance.toFixed(2) }}</span>
      <span>Gen</span><span>3</span>
    </div>
  </div>

  <div class="lab-progress" aria-hidden="true" />
</template>

<style scoped>
.lab-rail {
  position: fixed; right: 20px; top: 50%; transform: translateY(-50%); z-index: 40;
  display: flex; flex-direction: column; gap: 6px; align-items: flex-end;
}
.lab-rail-item {
  display: flex; align-items: center; gap: 10px; text-decoration: none;
  font-family: var(--darwin-font-mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--darwin-muted); padding: 2px 0;
}
.lab-rail-item.is-dark { color: rgba(243, 238, 226, 0.45); }
.lab-rail-label { opacity: 0; transform: translateX(6px); transition: opacity 0.25s, transform 0.25s; }
.lab-rail:hover .lab-rail-label, .lab-rail-item.is-active .lab-rail-label, .lab-rail-item:focus-visible .lab-rail-label { opacity: 1; transform: none; }
.lab-rail-num { width: 22px; text-align: right; }
.lab-rail-item.is-active { color: var(--darwin-accent); }
.lab-rail-item::after {
  content: ''; width: 14px; height: 1px; background: currentColor; transition: width 0.25s;
}
.lab-rail-item.is-active::after { width: 28px; }
.lab-rail-item:focus-visible { outline: 2px solid var(--darwin-accent); outline-offset: 2px; }

.lab-telemetry {
  position: fixed; left: 20px; bottom: 20px; z-index: 40; width: 220px;
  font-family: var(--darwin-font-mono); font-size: 10px; letter-spacing: 0.06em;
  padding: 12px 14px; border: 1px solid var(--darwin-border); border-radius: 8px;
  background: rgba(243, 238, 226, 0.72); color: var(--darwin-ink-soft);
  backdrop-filter: blur(10px); transition: background 0.6s, color 0.6s, border-color 0.6s;
}
.lab-telemetry.is-dark { background: rgba(10, 10, 10, 0.6); color: rgba(243, 238, 226, 0.75); border-color: rgba(243, 238, 226, 0.14); }
.lab-telemetry-head { text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
.lab-telemetry-dot { width: 6px; height: 6px; border-radius: 50%; background: #1f8a3e; animation: lab-blink 1s infinite; }
.lab-telemetry-dot.is-dead { background: #8a857a; animation: none; }
.lab-telemetry-grid { display: grid; grid-template-columns: auto 1fr; gap: 3px 14px; }
.lab-telemetry-grid span:nth-child(odd) { opacity: 0.55; }
@keyframes lab-blink { 50% { opacity: 0.3; } }

/* Mobile: rail and telemetry collapse to a reading-progress bar (CSS scroll timeline). */
.lab-progress { display: none; }
@media (max-width: 900px) {
  .lab-rail, .lab-telemetry { display: none; }
  .lab-progress {
    display: block; position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 60;
    background: var(--darwin-accent); transform-origin: 0 50%; transform: scaleX(0);
  }
  @supports (animation-timeline: scroll()) {
    .lab-progress { animation: lab-progress linear both; animation-timeline: scroll(root); }
  }
}
@keyframes lab-progress { to { transform: scaleX(1); } }
@media (prefers-reduced-motion: reduce) { .lab-telemetry-dot { animation: none; } }
</style>
