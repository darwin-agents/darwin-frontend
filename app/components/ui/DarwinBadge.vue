<script setup lang="ts">
defineProps<{
  color?: 'violet' | 'amber' | 'green' | 'red' | 'sky' | 'slate' | 'cyan' | 'indigo' | 'orange' | 'purple'
}>()
</script>

<template>
  <span
    class="inline-flex items-center text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border"
    :class="{
      'text-violet-300 bg-violet-500/10 border-violet-500/30': color === 'violet' || !color,
      'text-amber-300 bg-amber-500/10 border-amber-500/30': color === 'amber',
      'text-green-300 bg-green-500/10 border-green-500/30': color === 'green',
      'text-red-300 bg-red-500/10 border-red-500/30': color === 'red',
      'text-sky-300 bg-sky-500/10 border-sky-500/30': color === 'sky',
      'text-slate-300 bg-slate-500/10 border-slate-500/30': color === 'slate',
      'text-cyan-300 bg-cyan-500/10 border-cyan-500/30': color === 'cyan',
      'text-indigo-300 bg-indigo-500/10 border-indigo-500/30': color === 'indigo',
      'text-orange-300 bg-orange-500/10 border-orange-500/30': color === 'orange',
      'text-purple-300 bg-purple-500/10 border-purple-500/30': color === 'purple',
    }"
  >
    <slot />
  </span>
</template>
