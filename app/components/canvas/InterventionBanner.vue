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
  <div v-if="notifications.pending.length" class="shrink-0 space-y-1 px-3 py-2 bg-amber-500/[0.06] border-b border-amber-500/20">
    <div
      v-for="n in notifications.pending"
      :key="n.id"
      class="flex items-center gap-3 text-xs px-3 py-2 rounded-lg bg-amber-500/[0.06] border border-amber-500/15"
    >
      <AlertTriangle :size="14" class="text-amber-400 shrink-0 animate-pulse" />
      <span class="text-amber-200 flex-1">
        {{ eventLabels[n.event_type] ?? n.event_type }}
      </span>
      <span class="font-mono text-[10px] text-amber-400/60">{{ n.event_type }}</span>
      <button
        type="button"
        class="text-amber-400/60 hover:text-amber-200 transition-colors p-0.5"
        @click="dismiss(n.id)"
      >
        <X :size="12" />
      </button>
    </div>
  </div>
</template>
