<script setup lang="ts">
import { X } from 'lucide-vue-next'

export interface Toast {
  id: string
  message: string
  type?: 'info' | 'success' | 'error' | 'warning'
}

const toasts = useState<Toast[]>('darwin-toasts', () => [])

function dismiss(id: string) {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

function typeClass(type: Toast['type']) {
  if (type === 'success') return 'border-green-600/30 bg-green-50 text-green-800'
  if (type === 'error')   return 'border-red-600/30 bg-red-50 text-red-800'
  if (type === 'warning') return 'border-amber-600/30 bg-amber-50 text-amber-800'
  return 'text-darwin-ink-soft'
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="darwin-card flex items-start justify-between gap-2 px-3 py-2.5 text-sm shadow-xl pointer-events-auto"
          :class="typeClass(t.type)"
        >
          <span>{{ t.message }}</span>
          <button type="button" class="shrink-0 opacity-50 hover:opacity-100 mt-0.5" @click="dismiss(t.id)">
            <X :size="14" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
