<script setup lang="ts">
// Fixed chapter rail (inline-end edge: right, or left in RTL); collapses to a reading-progress bar on small screens.
const { t } = useI18n()
const { active } = useLabChapter()
const chapters = CHAPTER_IDS.filter((id) => id !== 'hero')
</script>

<template>
  <nav class="lab-rail" :aria-label="t('lab.hud.chapters')">
    <a
      v-for="(id, i) in chapters"
      :key="id"
      :href="`#${id}`"
      class="lab-rail-item"
      :class="{ 'is-active': active === id, 'is-dark': CHAPTERS[active].dark }"
      :aria-current="active === id ? 'true' : undefined"
    >
      <span class="lab-rail-label">{{ t(`lab.chapters.${id}`) }}</span>
      <span class="lab-rail-num">{{ String(i + 1).padStart(2, '0') }}</span>
    </a>
  </nav>

  <div class="lab-progress" aria-hidden="true" />
</template>

<style scoped>
.lab-rail {
  position: fixed; inset-inline-end: 12px; top: 50%; transform: translateY(-50%); z-index: 40;
  display: flex; flex-direction: column; gap: 6px; align-items: flex-end;
}
.lab-rail-item {
  display: flex; align-items: center; gap: 10px; text-decoration: none;
  font-family: var(--darwin-font-mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--darwin-muted); padding: 2px 0;
}
.lab-rail-item.is-dark { color: rgba(243, 238, 226, 0.45); }
.lab-rail-label { opacity: 0; transform: translateX(6px); transition: opacity 0.25s, transform 0.25s; }
.lab-rail:hover .lab-rail-label, .lab-rail-item:focus-visible .lab-rail-label { opacity: 1; transform: none; }
.lab-rail-num { width: 22px; text-align: end; }
.lab-rail-item.is-active { color: var(--darwin-accent); }
.lab-rail-item::after {
  content: ''; width: 14px; height: 1px; background: currentColor; transition: width 0.25s;
}
.lab-rail-item.is-active::after { width: 22px; }
.lab-rail-item:focus-visible { outline: 2px solid var(--darwin-accent); outline-offset: 2px; }

/* Mobile: the rail collapses to a reading-progress bar (CSS scroll timeline). */
.lab-progress { display: none; }
@media (max-width: 900px) {
  .lab-rail { display: none; }
  .lab-progress {
    display: block; position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 60;
    background: var(--darwin-accent); transform-origin: 0 50%; transform: scaleX(0);
  }
  @supports (animation-timeline: scroll()) {
    .lab-progress { animation: lab-progress linear both; animation-timeline: scroll(root); }
  }
}
@keyframes lab-progress { to { transform: scaleX(1); } }
</style>
