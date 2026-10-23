<script setup lang="ts">
import { X, Receipt, TrendingUp, TrendingDown } from 'lucide-vue-next'

const { t } = useI18n()
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
      class="fixed right-0 top-0 h-screen w-full max-w-sm bg-darwin-surface border-l border-darwin-border z-30 flex flex-col shadow-2xl"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b border-darwin-border shrink-0">
        <h2 class="text-sm font-semibold text-darwin-ink flex items-center gap-2">
          <Receipt :size="14" class="text-darwin-accent" />
          {{ t('panels.ledger.title') }}
        </h2>
        <button type="button" class="text-darwin-muted hover:text-darwin-ink p-1.5 rounded-md hover:bg-darwin-bg-3 transition-all" @click="panels.closeLedgerPanel()">
          <X :size="16" />
        </button>
      </div>

      <!-- Summary -->
      <div class="grid grid-cols-2 gap-3 p-4 border-b border-darwin-border shrink-0">
        <div class="rounded-lg bg-darwin-bg border border-darwin-border p-3 text-center">
          <div class="flex items-center justify-center gap-1 text-[10px] text-darwin-muted mb-1">
            <TrendingUp :size="10" />
            {{ t('panels.ledger.revenue') }}
          </div>
          <p class="text-lg font-semibold text-darwin-ink font-mono">${{ totalRevenue.toFixed(2) }}</p>
        </div>
        <div class="rounded-lg bg-darwin-bg border border-darwin-border p-3 text-center">
          <div class="flex items-center justify-center gap-1 text-[10px] text-darwin-muted mb-1">
            <TrendingDown :size="10" />
            {{ t('panels.ledger.burned') }}
          </div>
          <p class="text-lg font-semibold text-darwin-ink font-mono">${{ totalBurned.toFixed(2) }}</p>
        </div>
      </div>

      <!-- Transactions -->
      <div v-if="!transactions.length" class="flex-1 flex items-center justify-center">
        <p class="text-xs text-darwin-muted">{{ t('panels.ledger.empty') }}</p>
      </div>
      <div v-else class="flex-1 overflow-auto">
        <div
          v-for="(tx, i) in transactions"
          :key="i"
          class="flex items-center justify-between px-5 py-3 border-b border-darwin-border-soft text-sm"
        >
          <div>
            <p class="text-darwin-ink-soft text-xs">{{ tx.description ?? '—' }}</p>
            <p class="text-[10px] text-darwin-muted mt-0.5">{{ tx.type ?? '' }}</p>
          </div>
          <span
            :class="(tx.amount ?? 0) > 0 ? 'text-darwin-accent' : 'text-darwin-ink-soft'"
            class="font-mono text-xs"
          >
            {{ (tx.amount ?? 0) > 0 ? '+' : '' }}${{ Math.abs(tx.amount ?? 0).toFixed(2) }}
          </span>
        </div>
      </div>
    </div>
  </Transition>
</template>
