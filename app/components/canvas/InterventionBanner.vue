<script setup lang="ts">
import { AlertTriangle, X } from 'lucide-vue-next'

const notifications = useNotificationStore()

function dismiss(id: string) {
  notifications.dismiss(id)
}

const eventLabels: Record<string, string> = {
  ASK_HUMAN_SENT: 'Human input requested',
  APPROVAL_REQUESTED: 'Approval required',
  CAPTCHA_DELEGATED: 'CAPTCHA needs solving',
}
</script>

<template>
  <div v-if="notifications.pending.length" class="shrink-0 space-y-1 px-3 py-2 bg-darwin-accent/[0.08] border-b border-darwin-accent/20">
    <div
      v-for="n in notifications.pending"
      :key="n.id"
      class="flex items-center gap-3 text-xs px-3 py-2 rounded-xl bg-darwin-bg-2/90 border border-darwin-accent/15 shadow-sm"
    >
      <AlertTriangle :size="14" class="text-darwin-accent shrink-0 animate-pulse" />
      <span class="text-darwin-ink flex-1 font-medium">
        {{ eventLabels[n.event_type] ?? n.event_type }}
      </span>
      <span class="font-mono text-[10px] text-darwin-muted">{{ n.event_type }}</span>
      <button
        type="button"
        class="text-darwin-muted hover:text-darwin-ink transition-colors p-0.5 rounded-md hover:bg-darwin-bg-3"
        @click="dismiss(n.id)"
      >
        <X :size="12" />
      </button>
    </div>
  </div>
</template>
