<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  disabled?: boolean
}>()
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :class="{
      'darwin-btn-primary': variant === 'primary' || !variant,
      'darwin-btn-secondary': variant === 'secondary',
      'darwin-btn-ghost': variant === 'ghost',
      'darwin-btn-danger': variant === 'danger',
    }"
  >
    <slot />
  </button>
</template>
