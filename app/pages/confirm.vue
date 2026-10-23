<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

// OAuth / email-confirmation landing: the Supabase client reads the session from
// the URL hash, then useSupabaseUser() fills in and we move on to the dashboard.
definePageMeta({ layout: false })
useHead({ title: 'Signing in' })

const user = useSupabaseUser()
const stalled = ref(false)

watch(user, (u) => { if (u) void navigateTo('/dashboard', { replace: true }) }, { immediate: true })

onMounted(() => {
  const t = setTimeout(() => { stalled.value = true }, 8000)
  onUnmounted(() => clearTimeout(t))
})
</script>

<template>
  <div class="min-h-screen bg-darwin-bg flex items-center justify-center p-6">
    <div class="darwin-card p-8 w-full max-w-sm text-center">
      <template v-if="!stalled">
        <Loader2 :size="28" class="text-darwin-accent animate-spin mx-auto" />
        <p class="text-sm text-darwin-muted mt-4">Signing you in…</p>
      </template>
      <template v-else>
        <h1 class="text-xl font-semibold text-darwin-ink mb-2">Sign-in didn't complete</h1>
        <p class="text-sm text-darwin-muted mb-6">The link may have expired or already been used.</p>
        <NuxtLink to="/login" class="darwin-btn-secondary w-full justify-center inline-flex">
          Back to sign in
        </NuxtLink>
      </template>
    </div>
  </div>
</template>
