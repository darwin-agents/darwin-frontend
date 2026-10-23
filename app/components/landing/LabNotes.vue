<script setup lang="ts">
// "Lab notes": the technical layer under each chapter's plain-language story.
defineProps<{ items: [string, string][]; title?: string }>()
</script>

<template>
  <details class="lab-notes">
    <summary>
      <span class="lab-notes-label">Lab notes</span>
      <span class="lab-notes-title">{{ title ?? 'Specification' }}</span>
      <span class="lab-notes-plus" aria-hidden="true">+</span>
    </summary>
    <dl>
      <template v-for="[k, v] in items" :key="k">
        <dt>{{ k }}</dt>
        <dd>{{ v }}</dd>
      </template>
    </dl>
  </details>
</template>

<style scoped>
.lab-notes {
  border-top: 1px solid currentColor;
  border-color: color-mix(in srgb, currentColor 22%, transparent);
  font-family: var(--darwin-font-mono);
  font-size: 12px;
  margin-top: 40px;
}
summary {
  list-style: none; cursor: pointer;
  display: flex; align-items: center; gap: 16px; padding: 16px 0;
  text-transform: uppercase; letter-spacing: 0.14em; font-size: 11px;
}
summary::-webkit-details-marker { display: none; }
summary:focus-visible { outline: 2px solid var(--darwin-accent); outline-offset: 4px; }
.lab-notes-label { color: var(--darwin-accent); }
.lab-notes-title { opacity: 0.7; flex: 1; }
.lab-notes-plus { font-size: 16px; transition: transform 0.25s; }
.lab-notes[open] .lab-notes-plus { transform: rotate(45deg); }
dl {
  display: grid; grid-template-columns: minmax(140px, 0.4fr) 1fr; gap: 10px 24px;
  padding: 4px 0 24px; line-height: 1.6;
}
dt { opacity: 0.6; }
dd { margin: 0; }
@media (max-width: 640px) { dl { grid-template-columns: 1fr; gap: 2px; } dd { margin-bottom: 10px; } }
</style>
