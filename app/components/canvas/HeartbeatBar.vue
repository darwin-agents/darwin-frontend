<script setup lang="ts">
const canvas = useCanvasStore()

const max = computed(() => Math.max(...canvas.heartbeatSamples, 1))
</script>

<template>
  <div v-if="canvas.heartbeatSamples.length" class="flex items-end gap-0.5 h-4 px-2">
    <div
      v-for="(s, i) in canvas.heartbeatSamples"
      :key="i"
      class="w-1.5 bg-violet-500/60 rounded-sm transition-all duration-300"
      :style="{ height: `${(s / max) * 100}%` }"
    />
  </div>
</template>
