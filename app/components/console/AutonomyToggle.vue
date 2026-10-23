<script setup lang="ts">
const props = defineProps<{ darwinId: string }>()

const { t } = useI18n()
const agent = useAgentStore()
const toast = useToast()

async function toggleAutonomy() {
  const next = !agent.isAutonomyEnabled
  try {
    await agent.patchConfig(props.darwinId, { requires_approval: !next })
  } catch {
    toast(t('console.autonomy.failed'), 'error')
  }
}
</script>

<template>
  <div class="flex items-center justify-between gap-4">
    <div>
      <p class="text-sm text-darwin-ink">{{ t('console.autonomy.title') }}</p>
      <p class="text-xs text-darwin-muted">{{ t('console.autonomy.description') }}</p>
    </div>
    <button
      type="button"
      :class="agent.isAutonomyEnabled ? 'bg-darwin-accent' : 'bg-darwin-bg-3 border border-darwin-border'"
      class="relative w-10 h-5 rounded-full transition-colors shrink-0"
      :aria-label="t('console.autonomy.toggle')"
      @click="toggleAutonomy"
    >
      <span
        :class="agent.isAutonomyEnabled ? 'translate-x-5' : 'translate-x-0.5'"
        class="absolute top-0.5 w-4 h-4 bg-darwin-bg rounded-full transition-transform"
      />
    </button>
  </div>
</template>
