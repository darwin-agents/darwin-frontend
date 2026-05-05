<script setup lang="ts">
import { X, FileBox } from 'lucide-vue-next'

const panels = useCanvasPanels()
</script>

<template>
  <Transition name="slide-right">
    <div
      v-if="panels.showAssetsPanel"
      class="fixed right-0 top-0 h-screen w-full max-w-sm bg-darwin-surface border-l border-darwin-border z-30 flex flex-col shadow-2xl"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b border-darwin-border shrink-0">
        <h2 class="text-sm font-semibold text-darwin-ink flex items-center gap-2">
          <FileBox :size="14" class="text-darwin-accent" />
          Assets
        </h2>
        <button type="button" class="text-darwin-muted hover:text-darwin-ink p-1.5 rounded-md hover:bg-darwin-bg-3 transition-all" @click="panels.closeAssetsPanel()">
          <X :size="16" />
        </button>
      </div>
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center px-6">
          <FileBox :size="32" class="text-darwin-muted mx-auto mb-3" />
          <p class="text-xs text-darwin-muted">Uploaded files will appear here when the agent produces assets.</p>
        </div>
      </div>
    </div>
  </Transition>
</template>
