<script setup lang="ts">
import { Globe } from 'lucide-vue-next'

const { locale, locales, setLocale, t } = useI18n()
</script>

<template>
  <!-- Compact face (globe + code) over a transparent native select: menus stay native and accessible. -->
  <label class="locale-switcher">
    <Globe :size="15" aria-hidden="true" />
    <span aria-hidden="true">{{ locale.toUpperCase() }}</span>
    <select
      :value="locale"
      :aria-label="t('common.language')"
      @change="setLocale(($event.target as HTMLSelectElement).value as typeof locale)"
    >
      <option v-for="l in locales" :key="l.code" :value="l.code" :lang="l.language">{{ l.name }}</option>
    </select>
  </label>
</template>

<style scoped>
.locale-switcher {
  position: relative; display: inline-flex; align-items: center; gap: 6px; height: 38px; padding: 0 12px;
  border-radius: 100px; border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
  font-size: 12px; font-weight: 500; letter-spacing: 0.04em; cursor: pointer; transition: background 0.2s;
}
.locale-switcher:hover { background: color-mix(in srgb, currentColor 10%, transparent); }
.locale-switcher:has(select:focus-visible) { outline: 2px solid var(--darwin-accent); outline-offset: 3px; }
.locale-switcher select { position: absolute; inset: 0; width: 100%; opacity: 0; cursor: pointer; font-size: 16px; }
.locale-switcher option { color: var(--darwin-ink); background: var(--darwin-bg); }
</style>
