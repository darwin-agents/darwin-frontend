<script setup lang="ts">
definePageMeta({ layout: false })
const { t } = useI18n()
useHead({ title: () => t('spawn.pageTitle') })

const auth = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-darwin-bg">
    <!-- Header -->
    <header style="border-bottom: 1px solid var(--darwin-border)">
      <div class="max-w-3xl mx-auto px-6 py-3 flex items-center gap-3">
        <NuxtLink to="/dashboard" class="flex items-center gap-2">
          <UiDarwinLogo :size="28" />
        </NuxtLink>
        <div class="h-4 w-px bg-darwin-border" />
        <h1 class="text-sm font-medium text-darwin-ink">{{ t('spawn.heading') }}</h1>
      </div>
    </header>

    <main class="py-8">
      <SpawnForm v-if="auth.userId" />
      <div v-else class="text-center py-20">
        <p class="text-sm text-darwin-muted">{{ t('spawn.signInPrompt') }}</p>
        <NuxtLink to="/login" class="darwin-btn-primary mt-4 text-sm">{{ t('spawn.signIn') }}</NuxtLink>
      </div>
    </main>
  </div>
</template>
