<script setup lang="ts">
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
  <div
    v-if="panels.showSkillsPanel"
    class="fixed right-0 top-0 h-screen w-full max-w-sm bg-darwin-surface border-l border-white/10 z-30 flex flex-col"
  >
    <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
      <h2 class="text-sm font-semibold text-white">Skills</h2>
      <button type="button" class="text-slate-400 text-sm" @click="panels.closeSkillsPanel()">Close</button>
    </div>
    <div class="flex-1 overflow-y-auto space-y-2 p-4">
      <div
        v-for="(skill, idx) in skills"
        :key="`${(skill as { skill_id?: string }).skill_id ?? idx}`"
        class="bg-white/5 rounded border border-white/10 p-3"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-sm font-medium text-amber-400">{{ (skill as { title?: string }).title ?? 'Skill' }}</p>
            <p class="text-xs text-slate-400 mt-0.5">
              Royalty: ${{ (skill as { royalty_usdc?: number }).royalty_usdc ?? 0 }} USDC per use
            </p>
          </div>
          <span class="text-[10px] uppercase text-amber-400 border border-amber-500/40 rounded px-1.5 py-0.5">Skill</span>
        </div>
        <details class="mt-2">
          <summary class="text-xs text-slate-500 cursor-pointer">View document</summary>
          <pre class="mt-2 text-xs text-slate-300 whitespace-pre-wrap">{{
            (skill as { content_preview?: string }).content_preview ?? ''
          }}</pre>
        </details>
      </div>
    </div>
  </div>
</template>
