<script setup lang="ts">
import { Download, Share } from 'lucide-vue-next'

// Shows only when the app can actually be installed and isn't already.
defineProps<{ compact?: boolean }>()
const { canInstall, installed, iosManual, install } = usePwaInstall()
const showIosHint = ref(false)

function onClick() {
  if (canInstall.value) void install()
  else showIosHint.value = !showIosHint.value
}
</script>

<template>
  <div v-if="!installed && (canInstall || iosManual)" class="install">
    <button
      type="button"
      class="install-btn"
      :class="{ 'is-compact': compact }"
      :aria-label="compact ? 'Install the Darwin app' : undefined"
      :aria-expanded="iosManual ? showIosHint : undefined"
      @click="onClick"
    >
      <Download :size="15" />
      <span v-if="!compact">Install app</span>
    </button>
    <p v-if="showIosHint" class="install-hint" role="status">
      Tap <Share :size="13" class="install-hint-icon" /> <b>Share</b>, then <b>Add to Home Screen</b>.
    </p>
  </div>
</template>

<style scoped>
.install { position: relative; }
.install-btn {
  display: inline-flex; align-items: center; gap: 8px; height: 38px; padding: 0 14px;
  border-radius: 100px; border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
  background: transparent; color: inherit; font-size: 13px; font-weight: 500; cursor: pointer; transition: background 0.2s;
}
.install-btn:hover { background: color-mix(in srgb, currentColor 10%, transparent); }
.install-btn.is-compact { width: 38px; padding: 0; justify-content: center; }
.install-btn:focus-visible { outline: 2px solid var(--darwin-accent); outline-offset: 3px; }
.install-hint {
  position: absolute; right: 0; top: calc(100% + 8px); width: 230px; z-index: 60;
  padding: 12px 14px; border-radius: 10px; font-size: 12px; line-height: 1.5;
  background: var(--darwin-ink); color: var(--darwin-bg); box-shadow: 0 12px 30px -10px rgba(0, 0, 0, 0.4);
}
.install-hint-icon { display: inline; vertical-align: -2px; }
</style>
