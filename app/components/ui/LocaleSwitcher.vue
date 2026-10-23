<script setup lang="ts">
const { locale, locales, setLocale, t } = useI18n()
</script>

<template>
  <select
    class="locale-switcher"
    :value="locale"
    :aria-label="t('common.language')"
    @change="setLocale(($event.target as HTMLSelectElement).value as typeof locale)"
  >
    <option v-for="l in locales" :key="l.code" :value="l.code" :lang="l.language">{{ l.name }}</option>
  </select>
</template>

<style scoped>
.locale-switcher {
  height: 38px; padding: 0 12px; border-radius: 100px; cursor: pointer;
  border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
  background: transparent; color: inherit; font: inherit; font-size: 13px; font-weight: 500;
  transition: background 0.2s;
}
.locale-switcher:hover { background: color-mix(in srgb, currentColor 10%, transparent); }
.locale-switcher:focus-visible { outline: 2px solid var(--darwin-accent); outline-offset: 3px; }
.locale-switcher option { color: var(--darwin-ink); background: var(--darwin-bg); }
</style>
