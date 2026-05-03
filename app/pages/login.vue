<script setup lang="ts">
import { Dna, Mail, Loader2 } from 'lucide-vue-next'

const auth = useAuthStore()
const email = ref('')
const message = ref('')
const isSuccess = ref(false)
const loading = ref(false)

async function submitMagicLink() {
  loading.value = true
  message.value = ''
  isSuccess.value = false
  const { error } = await auth.loginWithMagicLink(email.value.trim())
  loading.value = false
  if (error) {
    message.value = error.message
  } else {
    isSuccess.value = true
    message.value = 'Check your email for the sign-in link.'
  }
}

async function google() {
  loading.value = true
  await auth.loginWithGoogle()
}
</script>

<template>
  <div class="min-h-screen bg-darwin-bg flex flex-col">
    <!-- Gradient accent -->
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-600/[0.06] rounded-full blur-[120px]" />
    </div>

    <!-- Back to home -->
    <div class="relative z-10 px-6 pt-6">
      <NuxtLink to="/" class="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors">
        <span>&larr;</span>
        <span>Back</span>
      </NuxtLink>
    </div>

    <!-- Centered card -->
    <div class="relative z-10 flex-1 flex items-center justify-center px-6 pb-12">
      <div class="w-full max-w-sm">
        <!-- Logo -->
        <div class="flex justify-center mb-8">
          <div class="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Dna :size="22" class="text-white" />
          </div>
        </div>

        <!-- Card -->
        <div class="darwin-card p-8">
          <div class="text-center mb-6">
            <h1 class="text-xl font-semibold text-white mb-1">Welcome back</h1>
            <p class="text-sm text-slate-500">Sign in to your Darwin console</p>
          </div>

          <!-- Magic link form -->
          <form class="space-y-3" @submit.prevent="submitMagicLink">
            <div>
              <label class="text-xs text-slate-500 mb-1.5 block">Email address</label>
              <input
                v-model="email"
                type="email"
                required
                placeholder="you@company.com"
                class="darwin-input"
                :disabled="loading"
              />
            </div>
            <button
              type="submit"
              class="darwin-btn-primary w-full"
              :disabled="loading || !email.trim()"
            >
              <Loader2 v-if="loading" :size="16" class="animate-spin" />
              <Mail v-else :size="16" />
              Email magic link
            </button>
          </form>

          <!-- Divider -->
          <div class="flex items-center gap-3 my-5">
            <div class="flex-1 h-px bg-white/[0.06]" />
            <span class="text-[10px] text-slate-600 uppercase tracking-wider">or</span>
            <div class="flex-1 h-px bg-white/[0.06]" />
          </div>

          <!-- Google OAuth -->
          <button
            type="button"
            class="darwin-btn-secondary w-full"
            :disabled="loading"
            @click="google"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <!-- Status message -->
          <Transition name="fade">
            <div v-if="message" class="mt-4">
              <div
                class="rounded-lg px-3 py-2.5 text-xs leading-relaxed"
                :class="isSuccess
                  ? 'bg-green-500/[0.08] text-green-300 border border-green-500/20'
                  : 'bg-red-500/[0.08] text-red-300 border border-red-500/20'"
              >
                {{ message }}
              </div>
            </div>
          </Transition>
        </div>

        <p class="text-center text-[11px] text-slate-600 mt-6">
          No password required — we use passwordless auth only.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
