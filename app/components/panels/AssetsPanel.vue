<script setup lang="ts">
const panels = useCanvasPanels()
</script>

<template>
  <div
    v-if="panels.showAssetsPanel"
    class="fixed right-0 top-0 h-screen w-full max-w-sm bg-darwin-surface border-l border-white/10 z-30 flex flex-col"
  >
    <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
      <h2 class="text-sm font-semibold text-white">Assets</h2>
      <button type="button" class="text-slate-400 text-sm" @click="panels.closeAssetsPanel()">Close</button>
    </div>
    <p class="p-4 text-xs text-slate-500">Uploaded files will appear here when the backend exposes assets for this agent.</p>
  </div>
</template>
