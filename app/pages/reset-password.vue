<script setup lang="ts">
import { Lock, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-vue-next'

definePageMeta({ layout: false })

const auth = useAuthStore()
const supabase = useSupabaseClient()

const password = ref('')
const confirm = ref('')
const showPw = ref(false)
const showConf = ref(false)
const loading = ref(false)
const error = ref('')
const done = ref(false)

/** false = still checking hash / session; true = show form or error */
const ready = ref(false)
const checking = ref(true)

let unsub: { unsubscribe: () => void } | undefined

function setupRecoveryListener() {
  const markReady = () => {
    ready.value = true
    checking.value = false
    error.value = ''
  }

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY' && session) {
      markReady()
    }
    if (event === 'INITIAL_SESSION' && session) {
      const hash = typeof window !== 'undefined' ? window.location.hash : ''
      const search = typeof window !== 'undefined' ? window.location.search : ''
      if (
        hash.includes('type=recovery')
        || hash.includes('recovery')
        || search.includes('type=recovery')
      ) {
        markReady()
      }
    }
  })
  unsub = data.subscription

  void (async () => {
    const { data: first } = await supabase.auth.getSession()
    if (first.session) {
      markReady()
      return
    }
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 80))
      const { data: d } = await supabase.auth.getSession()
      if (d.session) {
        markReady()
        return
      }
    }
    checking.value = false
    if (!ready.value) {
      error.value = 'This link is invalid or has expired. Request a new reset from the sign-in page.'
    }
  })()
}

onBeforeMount(() => {
  if (import.meta.client) {
    setupRecoveryListener()
  }
})

onUnmounted(() => {
  unsub?.unsubscribe()
})

async function submit() {
  if (loading.value) return
  error.value = ''
  if (password.value !== confirm.value) {
    error.value = 'Passwords do not match.'
    return
  }
  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }

  loading.value = true
  const { error: err } = await auth.updatePassword(password.value)
  loading.value = false

  if (err) error.value = err.message
  else done.value = true
}
</script>

<template>
  <div class="min-h-screen bg-darwin-bg flex flex-col">
    <div class="fixed inset-0 pointer-events-none">
      <div
        class="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[140px]"
        style="background: rgba(255,91,31,0.05)"
      />
    </div>

    <div class="relative z-10 flex-1 flex items-center justify-center px-6 pb-16">
      <div class="w-full max-w-sm">

        <div class="flex justify-center mb-8">
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center"
            style="background: var(--darwin-ink)"
          >
            <svg width="20" height="20" viewBox="0 0 22 22">
              <circle cx="11" cy="11" r="10" fill="none" stroke="#f3eee2" stroke-width="1.4" />
              <circle cx="11" cy="11" r="3.5" fill="#ff5b1f" />
            </svg>
          </div>
        </div>

        <div class="darwin-card p-8">

          <div v-if="checking" class="text-center py-8">
            <Loader2 :size="28" class="text-darwin-accent animate-spin mx-auto" />
            <p class="text-sm text-darwin-muted mt-4">Verifying reset link…</p>
          </div>

          <div v-else-if="done" class="text-center py-2">
            <CheckCircle :size="36" class="text-darwin-accent mx-auto mb-4" />
            <h1 class="text-xl font-semibold text-darwin-ink mb-2">Password updated</h1>
            <p class="text-sm text-darwin-muted mb-6">You can now sign in with your new password.</p>
            <NuxtLink to="/login" class="darwin-btn-primary w-full justify-center inline-flex">
              Go to sign in
            </NuxtLink>
          </div>

          <div v-else-if="!ready" class="text-center py-2">
            <h1 class="text-xl font-semibold text-darwin-ink mb-2">Link not valid</h1>
            <p class="text-sm text-darwin-muted mb-6">{{ error }}</p>
            <NuxtLink to="/login" class="darwin-btn-secondary w-full justify-center inline-flex">
              Back to sign in
            </NuxtLink>
          </div>

          <template v-else>
            <div class="text-center mb-6">
              <h1 class="text-xl font-semibold text-darwin-ink mb-1">Set new password</h1>
              <p class="text-sm text-darwin-muted">Choose a strong password for your account.</p>
            </div>

            <form class="space-y-3" novalidate @submit.prevent="submit">
              <div>
                <label class="text-xs text-darwin-muted mb-1.5 block" for="rp-pw">New password</label>
                <div class="relative">
                  <Lock :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-darwin-muted pointer-events-none" />
                  <input
                    id="rp-pw"
                    v-model="password"
                    :type="showPw ? 'text' : 'password'"
                    autocomplete="new-password"
                    placeholder="At least 8 characters"
                    class="darwin-input pl-9 pr-10"
                    :disabled="loading"
                  >
                  <button
                    type="button"
                    tabindex="-1"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-darwin-muted hover:text-darwin-ink transition-colors"
                    @click="showPw = !showPw"
                  >
                    <EyeOff v-if="showPw" :size="14" />
                    <Eye v-else :size="14" />
                  </button>
                </div>
              </div>

              <div>
                <label class="text-xs text-darwin-muted mb-1.5 block" for="rp-cf">Confirm password</label>
                <div class="relative">
                  <Lock :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-darwin-muted pointer-events-none" />
                  <input
                    id="rp-cf"
                    v-model="confirm"
                    :type="showConf ? 'text' : 'password'"
                    autocomplete="new-password"
                    placeholder="Repeat password"
                    class="darwin-input pl-9 pr-10"
                    :disabled="loading"
                  >
                  <button
                    type="button"
                    tabindex="-1"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-darwin-muted hover:text-darwin-ink transition-colors"
                    @click="showConf = !showConf"
                  >
                    <EyeOff v-if="showConf" :size="14" />
                    <Eye v-else :size="14" />
                  </button>
                </div>
              </div>

              <button type="submit" class="darwin-btn-primary w-full mt-1" :disabled="loading">
                <Loader2 v-if="loading" :size="15" class="animate-spin" />
                <span v-else>Update password</span>
              </button>
            </form>

            <Transition name="fade">
              <div v-if="error" class="mt-4 rounded-lg px-3 py-2.5 text-xs leading-relaxed border bg-red-50 text-red-800 border-red-600/20">
                {{ error }}
              </div>
            </Transition>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,
.fade-leave-to     { opacity: 0; }
</style>
