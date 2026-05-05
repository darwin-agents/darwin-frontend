<script setup lang="ts">
const props = defineProps<{ darwinId: string }>()

const agent = useAgentStore()
const injectionAmount = ref(50)

async function injectBudget() {
  const n = Number(injectionAmount.value)
  if (!n || n < 1) return
  await agent.patchConfig(props.darwinId, { budget_injection: n })
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center gap-2">
      <input v-model.number="injectionAmount" type="number" min="1" step="10" class="darwin-input w-24" placeholder="50" />
      <span class="text-sm text-darwin-muted">USD</span>
    </div>
    <p class="text-xs text-darwin-muted">
      Current balance: ${{ agent.balance.toFixed(2) }} → After: ${{ (agent.balance + (injectionAmount || 0)).toFixed(2) }}
    </p>
    <button type="button" class="darwin-btn-secondary w-full text-sm" @click="injectBudget">💉 Inject Budget</button>
  </div>
</template>
