<script setup lang="ts">
const props = defineProps<{ darwinId: string }>()

const agent = useAgentStore()

async function toggleAutonomy() {
  const next = !agent.isAutonomyEnabled
  await agent.patchConfig(props.darwinId, { requires_approval: !next })
}
</script>

<template>
  <div class="flex items-center justify-between gap-4">
    <div>
      <p class="text-sm text-white">Autonomy Mode</p>
      <p class="text-xs text-slate-400">When on, fewer human approval gates</p>
    </div>
    <button
      type="button"
      :class="agent.isAutonomyEnabled ? 'bg-violet-600' : 'bg-white/10'"
      class="relative w-10 h-5 rounded-full transition-colors shrink-0"
      aria-label="Toggle autonomy"
      @click="toggleAutonomy"
    >
      <span
        :class="agent.isAutonomyEnabled ? 'translate-x-5' : 'translate-x-0.5'"
        class="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform"
      />
    </button>
  </div>
</template>
