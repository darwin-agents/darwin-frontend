<script setup lang="ts">
import { X, Receipt, TrendingUp, TrendingDown } from 'lucide-vue-next'

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
  <Transition name="slide-right">
    <div
      v-if="panels.showLedgerPanel"
      class="fixed right-0 top-0 h-screen w-full max-w-sm bg-darwin-surface border-l border-white/[0.06] z-30 flex flex-col shadow-2xl"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
        <h2 class="text-sm font-semibold text-white flex items-center gap-2">
          <Receipt :size="14" class="text-green-400" />
          Ledger
        </h2>
        <button type="button" class="text-slate-500 hover:text-white p-1.5 rounded-md hover:bg-white/[0.06] transition-all" @click="panels.closeLedgerPanel()">
          <X :size="16" />
        </button>
      </div>

      <!-- Summary -->
      <div class="grid grid-cols-2 gap-3 p-4 border-b border-white/[0.06] shrink-0">
        <div class="rounded-lg bg-green-500/[0.06] border border-green-500/15 p-3 text-center">
          <div class="flex items-center justify-center gap-1 text-[10px] text-slate-500 mb-1">
            <TrendingUp :size="10" />
            Revenue
          </div>
          <p class="text-lg font-semibold text-green-400 font-mono">${{ totalRevenue.toFixed(2) }}</p>
        </div>
        <div class="rounded-lg bg-red-500/[0.06] border border-red-500/15 p-3 text-center">
          <div class="flex items-center justify-center gap-1 text-[10px] text-slate-500 mb-1">
            <TrendingDown :size="10" />
            Burned
          </div>
          <p class="text-lg font-semibold text-red-400 font-mono">${{ totalBurned.toFixed(2) }}</p>
        </div>
      </div>

      <!-- Transactions -->
      <div v-if="!transactions.length" class="flex-1 flex items-center justify-center">
        <p class="text-xs text-slate-600">No transactions yet.</p>
      </div>
      <div v-else class="flex-1 overflow-auto">
        <div
          v-for="(tx, i) in transactions"
          :key="i"
          class="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] text-sm"
        >
          <div>
            <p class="text-slate-200 text-xs">{{ tx.description ?? '—' }}</p>
            <p class="text-[10px] text-slate-600 mt-0.5">{{ tx.type ?? '' }}</p>
          </div>
          <span
            :class="(tx.amount ?? 0) > 0 ? 'text-green-400' : 'text-red-400'"
            class="font-mono text-xs"
          >
            {{ (tx.amount ?? 0) > 0 ? '+' : '' }}${{ Math.abs(tx.amount ?? 0).toFixed(2) }}
          </span>
        </div>
      </div>
    </div>
  </Transition>
</template>
