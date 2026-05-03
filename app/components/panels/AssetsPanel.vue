<script setup lang="ts">
import { X, FileBox } from 'lucide-vue-next'

const panels = useCanvasPanels()
</script>

<template>
  <Transition name="slide-right">
    <div
      v-if="panels.showAssetsPanel"
      class="fixed right-0 top-0 h-screen w-full max-w-sm bg-darwin-surface border-l border-white/[0.06] z-30 flex flex-col shadow-2xl"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
        <h2 class="text-sm font-semibold text-white flex items-center gap-2">
          <FileBox :size="14" class="text-slate-400" />
          Assets
        </h2>
        <button type="button" class="text-slate-500 hover:text-white p-1.5 rounded-md hover:bg-white/[0.06] transition-all" @click="panels.closeAssetsPanel()">
          <X :size="16" />
        </button>
      </div>
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center px-6">
          <FileBox :size="32" class="text-slate-700 mx-auto mb-3" />
          <p class="text-xs text-slate-600">Uploaded files will appear here when the agent produces assets.</p>
        </div>
      </div>
    </div>
  </Transition>
</template>
