<script setup lang="ts">
definePageMeta({ layout: false })

const auth = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-darwin-bg">
    <SpawnForm v-if="auth.userId" :owner-id="auth.userId" />
    <p v-else class="p-6 text-slate-500">Sign in to spawn an agent.</p>
  </div>
</template>
