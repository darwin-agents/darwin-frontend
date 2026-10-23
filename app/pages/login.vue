<script setup lang="ts">
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-vue-next'

type Mode = 'signin' | 'signup' | 'forgot'

useHead({ title: 'Sign in' })

const auth = useAuthStore()
const supabase = useSupabaseClient()

// Already signed in: skip the form.
const user = useSupabaseUser()
watch(user, (u) => { if (u) void navigateTo('/dashboard', { replace: true }) }, { immediate: true })

const mode = ref<Mode>('signin')

const email = ref('')
const password = ref('')
const confirm = ref('')
const showPw = ref(false)
const showConfirm = ref(false)

const loading = ref(false)
const message = ref('')
const isSuccess = ref(false)

function switchMode(m: Mode) {
  mode.value = m
  message.value = ''
  isSuccess.value = false
  if (m !== 'signup') confirm.value = ''
  if (m === 'forgot') {
    password.value = ''
    confirm.value = ''
  }
}

function setError(msg: string) {
  isSuccess.value = false
  message.value = msg
}

function setOk(msg: string) {
  isSuccess.value = true
  message.value = msg
}

/** Map Supabase / network errors to clearer copy */
function formatAuthError(err: { message: string; status?: number } | null): string {
  if (!err?.message) return 'Something went wrong. Please try again.'
  const m = err.message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'Wrong email or password.'
  if (m.includes('email not confirmed')) return 'Confirm your email first — we sent a link when you signed up.'
  if (m.includes('user already registered')) return 'An account with this email already exists. Try signing in.'
  if (m.includes('password')) return err.message
  return err.message
}

async function submit() {
  if (loading.value) return
  message.value = ''

  if (mode.value === 'signin') {
    const em = email.value.trim()
    if (!em || !password.value) return
    loading.value = true
    const { data, error } = await auth.loginWithPassword(em, password.value)
    loading.value = false
    if (error) {
      setError(formatAuthError(error))
      return
    }
    if (!data.session) {
      setError('Could not start a session. Please try again.')
      return
    }
    await supabase.auth.getSession()
    await navigateTo('/dashboard', { replace: true })
    return
  }

  if (mode.value === 'signup') {
    const em = email.value.trim()
    if (!em || !password.value) return
    if (password.value !== confirm.value) {
      setError('Passwords do not match.')
      return
    }
    if (password.value.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    loading.value = true
    const { data, error } = await auth.signUpWithPassword(em, password.value)
    loading.value = false
    if (error) {
      setError(formatAuthError(error))
      return
    }
    if (data.session) {
      await supabase.auth.getSession()
      await navigateTo('/dashboard', { replace: true })
      return
    }
    mode.value = 'signin'
    password.value = ''
    confirm.value = ''
    setOk('Check your email to confirm your account, then sign in here.')
    return
  }

  const em = email.value.trim()
  if (!em) return
  loading.value = true
  const { error } = await auth.resetPassword(em)
  loading.value = false
  if (error) setError(formatAuthError(error))
  else setOk('If an account exists for that email, we sent a reset link.')
}

async function google() {
  loading.value = true
  message.value = ''
  try {
    const { error } = await auth.loginWithGoogle()
    if (error) {
      setError(error.message)
      loading.value = false
    }
  } catch {
    loading.value = false
  }
}

const title = computed(() => ({
  signin: 'Welcome back',
  signup: 'Create account',
  forgot: 'Reset password',
})[mode.value])

const subtitle = computed(() => ({
  signin: 'Sign in to your Darwin console',
  signup: 'Start building autonomous agents',
  forgot: 'We will email you a link to choose a new password',
})[mode.value])
</script>

<template>
  <div class="min-h-screen bg-darwin-bg flex flex-col">
    <div class="fixed inset-0 pointer-events-none">
      <div
        class="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[140px]"
        style="background: rgba(255,91,31,0.05)"
      />
    </div>

    <div class="relative z-10 px-6 pt-6">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-1.5 text-sm transition-colors text-darwin-muted hover:text-darwin-ink"
      >
        ← Back
      </NuxtLink>
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

        <!-- Tabs: use Tailwind only (no inline :style) -->
        <div
          v-if="mode !== 'forgot'"
          class="flex rounded-lg overflow-hidden mb-6 p-0.5 gap-0.5"
          style="background: var(--darwin-bg-2); border: 1px solid var(--darwin-border)"
        >
          <button
            type="button"
            class="flex-1 py-2.5 text-sm font-medium rounded-md transition-colors"
            :class="mode === 'signin'
              ? 'bg-darwin-ink text-darwin-bg shadow-sm'
              : 'text-darwin-muted hover:text-darwin-ink'"
            @click="switchMode('signin')"
          >
            Sign in
          </button>
          <button
            type="button"
            class="flex-1 py-2.5 text-sm font-medium rounded-md transition-colors"
            :class="mode === 'signup'
              ? 'bg-darwin-ink text-darwin-bg shadow-sm'
              : 'text-darwin-muted hover:text-darwin-ink'"
            @click="switchMode('signup')"
          >
            Sign up
          </button>
        </div>

        <div class="darwin-card p-8">
          <div class="text-center mb-6">
            <h1 class="text-xl font-semibold text-darwin-ink mb-1">{{ title }}</h1>
            <p class="text-sm text-darwin-muted">{{ subtitle }}</p>
          </div>

          <form class="space-y-3" novalidate @submit.prevent="submit">
            <div>
              <label class="text-xs text-darwin-muted mb-1.5 block" for="login-email">Email address</label>
              <div class="relative">
                <Mail :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-darwin-muted pointer-events-none" />
                <input
                  id="login-email"
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  placeholder="you@company.com"
                  class="darwin-input pl-9"
                  :disabled="loading"
                >
              </div>
            </div>

            <template v-if="mode !== 'forgot'">
              <div>
                <label class="text-xs text-darwin-muted mb-1.5 block" for="login-password">Password</label>
                <div class="relative">
                  <Lock :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-darwin-muted pointer-events-none" />
                  <input
                    id="login-password"
                    v-model="password"
                    :type="showPw ? 'text' : 'password'"
                    :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'"
                    :placeholder="mode === 'signup' ? 'At least 8 characters' : 'Your password'"
                    class="darwin-input pl-9 pr-10"
                    :disabled="loading"
                  >
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-darwin-muted hover:text-darwin-ink transition-colors"
                    tabindex="-1"
                    :aria-pressed="showPw"
                    @click="showPw = !showPw"
                  >
                    <EyeOff v-if="showPw" :size="14" />
                    <Eye v-else :size="14" />
                  </button>
                </div>
              </div>

              <div v-if="mode === 'signup'">
                <label class="text-xs text-darwin-muted mb-1.5 block" for="login-confirm">Confirm password</label>
                <div class="relative">
                  <Lock :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-darwin-muted pointer-events-none" />
                  <input
                    id="login-confirm"
                    v-model="confirm"
                    :type="showConfirm ? 'text' : 'password'"
                    autocomplete="new-password"
                    placeholder="Repeat password"
                    class="darwin-input pl-9 pr-10"
                    :disabled="loading"
                  >
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-darwin-muted hover:text-darwin-ink transition-colors"
                    tabindex="-1"
                    :aria-pressed="showConfirm"
                    @click="showConfirm = !showConfirm"
                  >
                    <EyeOff v-if="showConfirm" :size="14" />
                    <Eye v-else :size="14" />
                  </button>
                </div>
              </div>

              <div v-if="mode === 'signin'" class="flex justify-end -mt-1">
                <button
                  type="button"
                  class="text-xs text-darwin-muted hover:text-darwin-accent transition-colors"
                  @click="switchMode('forgot')"
                >
                  Forgot password?
                </button>
              </div>
            </template>

            <button
              type="submit"
              class="darwin-btn-primary w-full mt-1"
              :disabled="loading"
            >
              <Loader2 v-if="loading" :size="15" class="animate-spin" />
              <span v-else-if="mode === 'signin'">Sign in</span>
              <span v-else-if="mode === 'signup'">Create account</span>
              <span v-else>Send reset link</span>
            </button>
          </form>

          <template v-if="mode !== 'forgot'">
            <div class="flex items-center gap-3 my-5">
              <div class="flex-1 h-px" style="background: var(--darwin-border)" />
              <span class="text-[10px] text-darwin-muted uppercase tracking-wider">or</span>
              <div class="flex-1 h-px" style="background: var(--darwin-border)" />
            </div>

            <button
              type="button"
              class="darwin-btn-secondary w-full"
              :disabled="loading"
              @click="google"
            >
              <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </template>

          <div v-else class="mt-4 text-center">
            <button
              type="button"
              class="text-xs text-darwin-muted hover:text-darwin-ink transition-colors"
              @click="switchMode('signin')"
            >
              ← Back to sign in
            </button>
          </div>

          <Transition name="fade">
            <div v-if="message" class="mt-4">
              <div
                class="rounded-lg px-3 py-2.5 text-xs leading-relaxed border"
                :class="isSuccess
                  ? 'bg-green-50 text-green-800 border-green-600/20'
                  : 'bg-red-50 text-red-800 border-red-600/20'"
              >
                {{ message }}
              </div>
            </div>
          </Transition>
        </div>

        <p class="text-center text-[11px] text-darwin-muted mt-5">
          By continuing you agree to our
          <a href="#" class="underline hover:text-darwin-ink transition-colors">Terms</a>
          &amp;
          <a href="#" class="underline hover:text-darwin-ink transition-colors">Privacy Policy</a>.
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
