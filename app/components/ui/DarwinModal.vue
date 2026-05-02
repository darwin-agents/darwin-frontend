<script setup lang="ts">
const model = defineModel<boolean>({ default: false })

defineProps<{
  title: string
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="model"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      @click.self="model = false"
    >
      <div class="bg-darwin-surface border border-white/10 rounded-lg max-w-md w-full shadow-2xl">
        <div class="px-4 py-3 border-b border-white/10">
          <h2 class="text-sm font-semibold text-white">{{ title }}</h2>
        </div>
        <div class="p-4 text-sm text-slate-300">
          <slot />
        </div>
        <div v-if="$slots.footer" class="px-4 py-3 border-t border-white/10 flex justify-end gap-2">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
