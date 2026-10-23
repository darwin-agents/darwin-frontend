<script setup lang="ts">
// Airlock shown on a visitor's first arrival. An inline head script (pages/index.vue)
// adds `lab-gate-open` to <html> before first paint only when the visitor hasn't
// entered before, so returning visitors and no-JS crawlers never see it.
const audio = useLabAudio()
const enterBtn = useTemplateRef<HTMLButtonElement>('enter')

const LOG = [
  'Specimen Labs · containment online',
  'Genome signature verified · Ed25519',
  'Constitution loaded · 10 principles · 7 forbidden classes',
  'Treasury gate armed · 6 checks',
  'Kill switch armed · halt ≤ 5 s',
  'Specimen DRW-0847 · heartbeat detected',
]

function enter(withSound: boolean) {
  void audio.setEnabled(withSound).then(() => { if (withSound) audio.chime() })
  try { localStorage.setItem('darwin-lab-entered', '1') } catch { /* private mode */ }
  document.documentElement.classList.remove('lab-gate-open')
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && document.documentElement.classList.contains('lab-gate-open')) enter(false)
}

onMounted(() => {
  if (document.documentElement.classList.contains('lab-gate-open')) enterBtn.value?.focus()
  window.addEventListener('keydown', onKey)
})
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="lab-gate" role="dialog" aria-modal="true" aria-labelledby="lab-gate-title">
    <div class="lab-gate-inner">
      <svg width="40" height="40" viewBox="0 0 22 22" class="lab-gate-logo" aria-hidden="true">
        <circle cx="11" cy="11" r="10" fill="none" stroke="#f3eee2" stroke-width="1.2" />
        <circle cx="11" cy="11" r="3.5" fill="#ff5b1f" />
      </svg>
      <div id="lab-gate-title" class="lab-gate-title">Darwin Agents</div>
      <p class="lab-gate-sub">You are entering an observation lab for digital organisms.</p>
      <ol class="lab-gate-log">
        <li v-for="(line, i) in LOG" :key="line" :style="{ animationDelay: `${0.25 + i * 0.28}s` }">
          <span class="lab-gate-ok">●</span> {{ line }}
        </li>
      </ol>
      <div class="lab-gate-actions">
        <button ref="enter" type="button" class="lab-gate-btn lab-gate-btn-primary" @click="enter(true)">
          Enter with sound
        </button>
        <button type="button" class="lab-gate-btn" @click="enter(false)">Enter silently</button>
      </div>
      <p class="lab-gate-hint">Headphones recommended · sound can be toggled any time</p>
    </div>
  </div>
</template>

<style scoped>
.lab-gate {
  display: none;
  position: fixed; inset: 0; z-index: 100;
  background: radial-gradient(ellipse at 50% 40%, #1a120d 0%, #0a0a0a 70%);
  color: #f3eee2;
  align-items: center; justify-content: center; padding: 24px;
}
.lab-gate-inner { max-width: 520px; width: 100%; }
.lab-gate-logo { margin-bottom: 28px; animation: lab-gate-pulse 1.6s ease-in-out infinite; }
.lab-gate-title { font-size: clamp(40px, 7vw, 64px); letter-spacing: -0.04em; line-height: 1; font-weight: 400; margin-bottom: 12px; }
.lab-gate-sub { font-size: 16px; color: rgba(243, 238, 226, 0.65); margin-bottom: 36px; }
.lab-gate-log {
  font-family: var(--darwin-font-mono); font-size: 12px; line-height: 2;
  color: rgba(243, 238, 226, 0.75); margin-bottom: 40px; list-style: none; padding: 0;
}
.lab-gate-log li { opacity: 0; animation: lab-gate-line 0.35s ease forwards; }
.lab-gate-ok { color: #7ad08f; margin-right: 8px; }
.lab-gate-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
.lab-gate-btn {
  padding: 16px 28px; border-radius: 100px; font-size: 14px; font-weight: 500;
  border: 1px solid rgba(243, 238, 226, 0.3); background: transparent; color: #f3eee2; cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}
.lab-gate-btn:hover { background: rgba(243, 238, 226, 0.08); transform: translateY(-1px); }
.lab-gate-btn:focus-visible { outline: 2px solid #ff5b1f; outline-offset: 3px; }
.lab-gate-btn-primary { background: #ff5b1f; border-color: #ff5b1f; color: #0a0a0a; }
.lab-gate-btn-primary:hover { background: #ff7a45; }
.lab-gate-hint { font-family: var(--darwin-font-mono); font-size: 11px; color: rgba(243, 238, 226, 0.4); letter-spacing: 0.08em; }
@keyframes lab-gate-line { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: none; } }
@keyframes lab-gate-pulse { 0%, 100% { transform: scale(1); } 15% { transform: scale(1.12); } 30% { transform: scale(1); } 42% { transform: scale(1.07); } }
@media (prefers-reduced-motion: reduce) {
  .lab-gate-log li { animation: none; opacity: 1; }
  .lab-gate-logo { animation: none; }
}
</style>

<style>
/* Unscoped: keyed off the <html> class set by the inline head script. */
html.lab-gate-open { overflow: hidden; }
html.lab-gate-open .lab-gate { display: flex; }
</style>
