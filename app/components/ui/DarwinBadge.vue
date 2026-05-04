<script setup lang="ts">
defineProps<{
  color?: 'ember' | 'amber' | 'green' | 'red' | 'sky' | 'slate' | 'cyan' | 'indigo' | 'orange' | 'purple'
}>()
</script>

<template>
  <span
    class="inline-flex items-center text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border"
    :class="{
      'text-darwin-bg bg-darwin-accent border-darwin-accent-deep': color === 'ember' || !color,
      'text-amber-700 bg-amber-500/10 border-amber-500/30': color === 'amber',
      'text-green-700 bg-green-500/10 border-green-500/30': color === 'green',
      'text-red-700 bg-red-500/10 border-red-500/30': color === 'red',
      'text-sky-700 bg-sky-500/10 border-sky-500/30': color === 'sky',
      'text-darwin-muted bg-darwin-bg-2 border-darwin-border': color === 'slate',
      'text-cyan-700 bg-cyan-500/10 border-cyan-500/30': color === 'cyan',
      'text-indigo-700 bg-indigo-500/10 border-indigo-500/30': color === 'indigo',
      'text-orange-700 bg-orange-500/10 border-orange-500/30': color === 'orange',
      'text-purple-700 bg-purple-500/10 border-purple-500/30': color === 'purple',
    }"
  >
    <slot />
  </span>
</template>
