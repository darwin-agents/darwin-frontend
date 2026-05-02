<script setup lang="ts">
const auth = useAuthStore()
const email = ref('')
const message = ref('')
const loading = ref(false)

async function submitMagicLink() {
  loading.value = true
  message.value = ''
  const { error } = await auth.loginWithMagicLink(email.value.trim())
  loading.value = false
  if (error) message.value = error.message
  else message.value = 'Check your email for the sign-in link.'
}

async function google() {
  loading.value = true
  await auth.loginWithGoogle()
}
</script>

<template>
  <div class="min-h-screen bg-darwin-bg flex items-center justify-center p-6">
    <div class="w-full max-w-md space-y-6 border border-white/10 rounded-xl bg-darwin-surface p-8 shadow-xl">
      <div class="text-center">
        <h1 class="text-xl font-semibold text-white">Sign in</h1>
        <p class="text-sm text-slate-500 mt-1">Passwordless magic link or Google</p>
      </div>
      <form class="space-y-3" @submit.prevent="submitMagicLink">
        <input v-model="email" type="email" required placeholder="you@company.com" class="darwin-input w-full" />
        <button type="submit" class="darwin-btn-primary w-full" :disabled="loading">
          Email magic link
        </button>
      </form>
      <button type="button" class="darwin-btn-secondary w-full" :disabled="loading" @click="google">
        Continue with Google
      </button>
      <p v-if="message" class="text-xs text-center text-slate-400">{{ message }}</p>
    </div>
  </div>
</template>
