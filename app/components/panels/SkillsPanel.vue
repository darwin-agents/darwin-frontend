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
      class="fixed right-0 top-0 h-screen w-full max-w-sm bg-darwin-surface border-l border-darwin-border z-30 flex flex-col shadow-2xl"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b border-darwin-border shrink-0">
        <h2 class="text-sm font-semibold text-darwin-ink flex items-center gap-2">
          <Star :size="14" class="text-darwin-accent" />
          Skills
        </h2>
        <button type="button" class="text-darwin-muted hover:text-darwin-ink p-1.5 rounded-md hover:bg-darwin-bg-3 transition-all" @click="panels.closeSkillsPanel()">
          <X :size="16" />
        </button>
      </div>
      <div v-if="!skills.length" class="flex-1 flex items-center justify-center">
        <p class="text-xs text-darwin-muted">No skills created yet.</p>
      </div>
      <div v-else class="flex-1 overflow-y-auto p-4 space-y-2">
        <div
          v-for="(skill, idx) in skills"
          :key="`${(skill as { skill_id?: string }).skill_id ?? idx}`"
          class="rounded-lg border border-darwin-border bg-darwin-bg p-4"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="text-sm font-medium text-darwin-ink">{{ (skill as { title?: string }).title ?? 'Skill' }}</p>
              <p class="text-[11px] text-darwin-muted mt-0.5">
                Royalty: ${{ (skill as { royalty_usdc?: number }).royalty_usdc ?? 0 }} USDC per use
              </p>
            </div>
            <span class="darwin-badge text-darwin-accent bg-darwin-accent/10 border-darwin-accent/30">Skill</span>
          </div>
          <details class="mt-3">
            <summary class="text-[11px] text-darwin-muted cursor-pointer hover:text-darwin-ink-soft transition-colors">View document</summary>
            <pre class="mt-2 text-[11px] text-darwin-ink-soft whitespace-pre-wrap leading-relaxed bg-darwin-bg-2 rounded-lg p-2.5 border border-darwin-border-soft">{{ (skill as { content_preview?: string }).content_preview ?? '' }}</pre>
          </details>
        </div>
      </div>
    </div>
  </Transition>
</template>
