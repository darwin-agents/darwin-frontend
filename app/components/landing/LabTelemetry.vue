<script setup lang="ts">
// Live readout of the (simulated) specimen, shown in the nav.
const { t } = useI18n()
const { active, stage, killed } = useLabChapter()
const vitals = useState('lab-vitals', () => ({ bpm: 63, alive: true }))

const STAGE_BALANCE = [100, 99.62, 131.4, 131.4, 78.2, 0.84]
const balance = computed(() => {
  if (killed.value) return 0
  if (active.value === 'lifecycle') return STAGE_BALANCE[stage.value] ?? 100
  return 142.18
})
const state = computed(() => {
  if (killed.value) return t('lab.telemetry.state.halted')
  if (active.value === 'lifecycle') return t(`lab.telemetry.state.${LIFECYCLE_STAGES[stage.value] ?? 'birth'}`)
  return t('lab.telemetry.state.foraging')
})
</script>

<template>
  <div class="lab-tm mono" :title="t('lab.telemetry.title', { id: 'DRW-0847' })" aria-hidden="true">
    <span class="lab-tm-dot" :class="{ 'is-dead': !vitals.alive }" />
    <span>DRW-0847</span>
    <span class="lab-tm-sep">·</span>
    <span>{{ state }}</span>
    <span class="lab-tm-sep">·</span>
    <span>{{ vitals.alive ? t('lab.telemetry.bpm', { n: vitals.bpm }) : t('lab.telemetry.flatline') }}</span>
    <span class="lab-tm-sep">·</span>
    <span>${{ balance.toFixed(2) }}</span>
  </div>
</template>

<style scoped>
.lab-tm {
  display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 100px;
  font-size: 10px; letter-spacing: 0.04em; white-space: nowrap;
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent); opacity: 0.85;
}
.lab-tm-sep { opacity: 0.4; }
.lab-tm-dot { width: 6px; height: 6px; border-radius: 50%; background: #1f8a3e; animation: lab-tm-blink 1s infinite; }
.lab-tm-dot.is-dead { background: #8a857a; animation: none; }
@keyframes lab-tm-blink { 50% { opacity: 0.3; } }
@media (max-width: 1360px) { .lab-tm { display: none; } }
@media (prefers-reduced-motion: reduce) { .lab-tm-dot { animation: none; } }
</style>
