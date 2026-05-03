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
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        @click.self="model = false"
      >
        <div class="darwin-card max-w-md w-full shadow-2xl animate-slide-up">
          <div class="px-5 py-4 border-b border-white/[0.06]">
            <h2 class="text-sm font-semibold text-white">{{ title }}</h2>
          </div>
          <div class="px-5 py-4 text-sm text-slate-300">
            <slot />
          </div>
          <div v-if="$slots.footer" class="px-5 py-3 border-t border-white/[0.06] flex justify-end gap-2">
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
