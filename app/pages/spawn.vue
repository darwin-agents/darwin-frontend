<script setup lang="ts">
import { Dna } from 'lucide-vue-next'

definePageMeta({ layout: false })

const auth = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-darwin-bg">
    <!-- Header -->
    <header class="border-b border-white/[0.06]">
      <div class="max-w-3xl mx-auto px-6 py-3 flex items-center gap-3">
        <NuxtLink to="/dashboard" class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <Dna :size="14" class="text-white" />
          </div>
        </NuxtLink>
        <div class="h-4 w-px bg-white/[0.08]" />
        <h1 class="text-sm font-medium text-white">Spawn Agent</h1>
      </div>
    </header>

    <main class="py-8">
      <SpawnForm v-if="auth.userId" :owner-id="auth.userId" />
      <div v-else class="text-center py-20">
        <p class="text-sm text-slate-500">Sign in to spawn an agent.</p>
        <NuxtLink to="/login" class="darwin-btn-primary mt-4 text-sm">Sign in</NuxtLink>
      </div>
    </main>
  </div>
</template>
