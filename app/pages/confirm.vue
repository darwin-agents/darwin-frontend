<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

// OAuth / email-confirmation landing: the Supabase client reads the session from
// the URL hash, then useSupabaseUser() fills in and we move on to the dashboard.
definePageMeta({ layout: false })
const { t } = useI18n()
useHead({ title: () => t('auth.confirm.pageTitle') })

const user = useSupabaseUser()
const stalled = ref(false)

watch(user, (u) => { if (u) void navigateTo('/dashboard', { replace: true }) }, { immediate: true })

onMounted(() => {
  const timer = setTimeout(() => { stalled.value = true }, 8000)
  onUnmounted(() => clearTimeout(timer))
})
</script>

<template>
  <div class="min-h-screen bg-darwin-bg flex items-center justify-center p-6">
    <div class="darwin-card p-8 w-full max-w-sm text-center">
      <template v-if="!stalled">
        <Loader2 :size="28" class="text-darwin-accent animate-spin mx-auto" />
        <p class="text-sm text-darwin-muted mt-4">{{ t('auth.confirm.signingIn') }}</p>
      </template>
      <template v-else>
        <h1 class="text-xl font-semibold text-darwin-ink mb-2">{{ t('auth.confirm.stalledTitle') }}</h1>
        <p class="text-sm text-darwin-muted mb-6">{{ t('auth.confirm.stalledBody') }}</p>
        <NuxtLink to="/login" class="darwin-btn-secondary w-full justify-center inline-flex">
          {{ t('auth.backToSignIn') }}
        </NuxtLink>
      </template>
    </div>
  </div>
</template>
