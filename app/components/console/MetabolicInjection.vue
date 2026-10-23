<script setup lang="ts">
const props = defineProps<{ darwinId: string }>()

const { t } = useI18n()
const agent = useAgentStore()
const toast = useToast()
const injectionAmount = ref(50)

async function injectBudget() {
  const n = Number(injectionAmount.value)
  if (!n || n < 1) return
  try {
    await agent.patchConfig(props.darwinId, { budget_injection: n })
    toast(t('console.budget.injected', { amount: n }), 'success')
  } catch {
    toast(t('console.budget.failed'), 'error')
  }
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center gap-2">
      <input v-model.number="injectionAmount" type="number" min="1" step="10" class="darwin-input w-24" placeholder="50" />
      <span class="text-sm text-darwin-muted">USD</span>
    </div>
    <p class="text-xs text-darwin-muted">
      {{ t('console.budget.preview', { current: agent.balance.toFixed(2), after: (agent.balance + (injectionAmount || 0)).toFixed(2) }) }}
    </p>
    <button type="button" class="darwin-btn-secondary w-full text-sm" @click="injectBudget">{{ t('console.budget.submit') }}</button>
  </div>
</template>
