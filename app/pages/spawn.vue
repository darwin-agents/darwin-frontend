<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Spawn a Darwin' })

const auth = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-darwin-bg">
    <!-- Header -->
    <header style="border-bottom: 1px solid var(--darwin-border)">
      <div class="max-w-3xl mx-auto px-6 py-3 flex items-center gap-3">
        <NuxtLink to="/dashboard" class="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 22 22">
            <circle cx="11" cy="11" r="10" fill="none" stroke="var(--darwin-ink)" stroke-width="1.4" />
            <circle cx="11" cy="11" r="3.5" fill="var(--darwin-accent)" />
          </svg>
        </NuxtLink>
        <div class="h-4 w-px bg-darwin-border" />
        <h1 class="text-sm font-medium text-darwin-ink">Spawn Agent</h1>
      </div>
    </header>

    <main class="py-8">
      <SpawnForm v-if="auth.userId" />
      <div v-else class="text-center py-20">
        <p class="text-sm text-darwin-muted">Sign in to spawn an agent.</p>
        <NuxtLink to="/login" class="darwin-btn-primary mt-4 text-sm">Sign in</NuxtLink>
      </div>
    </main>
  </div>
</template>
