<script setup lang="ts">
const model = defineModel<boolean>({ default: false })

defineProps<{
  title: string
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="model"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style="background: rgba(10,10,10,0.45); backdrop-filter: blur(4px)"
        @click.self="model = false"
      >
        <div class="darwin-card max-w-md w-full shadow-2xl animate-slide-up">
          <div class="px-5 py-4" style="border-bottom: 1px solid var(--darwin-border)">
            <h2 class="text-sm font-semibold text-darwin-ink">{{ title }}</h2>
          </div>
          <div class="px-5 py-4 text-sm text-darwin-ink-soft">
            <slot />
          </div>
          <div v-if="$slots.footer" class="px-5 py-3 flex justify-end gap-2" style="border-top: 1px solid var(--darwin-border)">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
