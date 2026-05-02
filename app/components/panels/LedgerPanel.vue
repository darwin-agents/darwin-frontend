<script setup lang="ts">
const canvas = useCanvasStore()
const panels = useCanvasPanels()

const transactions = computed(() =>
  canvas.events
    .filter((e) => e.event_type === 'LEDGER_DEBIT' || e.event_type === 'LEDGER_CREDIT')
    .map((e) => e.payload as { amount?: number; description?: string; type?: string })
    .reverse(),
)

const totalRevenue = computed(() =>
  transactions.value.filter((t) => (t.amount ?? 0) > 0).reduce((s, t) => s + (t.amount ?? 0), 0),
)

const totalBurned = computed(() =>
  transactions.value.filter((t) => (t.amount ?? 0) < 0).reduce((s, t) => s + Math.abs(t.amount ?? 0), 0),
)
</script>

<template>
  <div
    v-if="panels.showLedgerPanel"
    class="fixed right-0 top-0 h-screen w-full max-w-sm bg-darwin-surface border-l border-white/10 z-30 flex flex-col"
  >
    <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
      <h2 class="text-sm font-semibold text-white">Ledger</h2>
      <button type="button" class="text-slate-400 text-sm" @click="panels.closeLedgerPanel()">Close</button>
    </div>
    <div class="grid grid-cols-2 gap-2 p-4 border-b border-white/10 shrink-0">
      <div class="bg-green-900/20 rounded p-2 text-center">
        <p class="text-xs text-slate-400">Revenue</p>
        <p class="text-lg font-semibold text-green-400">${{ totalRevenue.toFixed(2) }}</p>
      </div>
      <div class="bg-red-900/20 rounded p-2 text-center">
        <p class="text-xs text-slate-400">Burned</p>
        <p class="text-lg font-semibold text-red-400">${{ totalBurned.toFixed(2) }}</p>
      </div>
    </div>
    <div class="flex-1 overflow-auto">
      <div
        v-for="(tx, i) in transactions"
        :key="i"
        class="flex items-center justify-between px-4 py-2 border-b border-white/5 text-sm"
      >
        <div>
          <p class="text-slate-200">{{ tx.description ?? '—' }}</p>
          <p class="text-xs text-slate-500">{{ tx.type ?? '' }}</p>
        </div>
        <span :class="(tx.amount ?? 0) > 0 ? 'text-green-400' : 'text-red-400'" class="font-mono">
          {{ (tx.amount ?? 0) > 0 ? '+' : '' }}${{ Math.abs(tx.amount ?? 0).toFixed(2) }}
        </span>
      </div>
    </div>
  </div>
</template>
