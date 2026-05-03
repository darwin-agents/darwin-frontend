<script setup lang="ts">
import { X, Star } from 'lucide-vue-next'

const canvas = useCanvasStore()
const panels = useCanvasPanels()

const skills = computed(() =>
  canvas.events
    .filter((e) => e.event_type === 'SKILL_CREATED')
    .map((e) => e.payload)
    .reverse(),
)
</script>

<template>
  <Transition name="slide-right">
    <div
      v-if="panels.showSkillsPanel"
      class="fixed right-0 top-0 h-screen w-full max-w-sm bg-darwin-surface border-l border-white/[0.06] z-30 flex flex-col shadow-2xl"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
        <h2 class="text-sm font-semibold text-white flex items-center gap-2">
          <Star :size="14" class="text-amber-400" />
          Skills
        </h2>
        <button type="button" class="text-slate-500 hover:text-white p-1.5 rounded-md hover:bg-white/[0.06] transition-all" @click="panels.closeSkillsPanel()">
          <X :size="16" />
        </button>
      </div>
      <div v-if="!skills.length" class="flex-1 flex items-center justify-center">
        <p class="text-xs text-slate-600">No skills created yet.</p>
      </div>
      <div v-else class="flex-1 overflow-y-auto p-4 space-y-2">
        <div
          v-for="(skill, idx) in skills"
          :key="`${(skill as { skill_id?: string }).skill_id ?? idx}`"
          class="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="text-sm font-medium text-amber-400">{{ (skill as { title?: string }).title ?? 'Skill' }}</p>
              <p class="text-[11px] text-slate-500 mt-0.5">
                Royalty: ${{ (skill as { royalty_usdc?: number }).royalty_usdc ?? 0 }} USDC per use
              </p>
            </div>
            <span class="darwin-badge text-amber-300 bg-amber-500/10 border-amber-500/20">Skill</span>
          </div>
          <details class="mt-3">
            <summary class="text-[11px] text-slate-500 cursor-pointer hover:text-slate-400 transition-colors">View document</summary>
            <pre class="mt-2 text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.04]">{{ (skill as { content_preview?: string }).content_preview ?? '' }}</pre>
          </details>
        </div>
      </div>
    </div>
  </Transition>
</template>
