<script setup lang="ts">
// The Darwin mark: a mother cell (ember nucleus) budding a daughter that carries the same
// spark — inherit, grow, divide. Membranes use currentColor so it sits on sand or ink.
// `mono` paints the nuclei in currentColor too (empty states).
// Static copies live in public/favicon.svg, public/offline.html and the generated icons;
// keep the geometry in sync if it changes.
withDefaults(defineProps<{ size?: number; mono?: boolean }>(), { size: 22, mono: false })
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <circle cx="28" cy="36" r="18.5" stroke="currentColor" stroke-width="4.4" />
    <path d="M39.2 21.3 42.7 24.8" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
    <circle cx="46.5" cy="17.5" r="8" stroke="currentColor" stroke-width="3.9" />
    <circle cx="28" cy="36" r="8.2" :fill="mono ? 'currentColor' : '#ff5b1f'" />
    <circle cx="46.5" cy="17.5" r="3.2" :fill="mono ? 'currentColor' : '#ff5b1f'" />
  </svg>
</template>
