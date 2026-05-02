<script setup lang="ts">
const notifications = useNotificationStore()

function dismiss(id: string) {
  notifications.dismiss(id)
}
</script>

<template>
  <div v-if="notifications.pending.length" class="shrink-0 space-y-1 px-2 py-1 bg-amber-950/40 border-b border-amber-900/40">
    <div
      v-for="n in notifications.pending"
      :key="n.id"
      class="flex items-center justify-between gap-2 text-xs text-amber-100 px-2 py-1 rounded bg-amber-900/20"
    >
      <span class="font-mono text-[10px]">{{ n.event_type }}</span>
      <button type="button" class="text-amber-400/80 hover:text-amber-200 text-[10px]" @click="dismiss(n.id)">
        Dismiss
      </button>
    </div>
  </div>
</template>
