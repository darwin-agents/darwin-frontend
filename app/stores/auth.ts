import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const session = useSupabaseSession()

  /** Prefer session.user (present at runtime, omitted from the module's types); JWT claims use `sub`. */
  const userId = computed(
    () => (session.value as { user?: { id?: string } } | null)?.user?.id
      ?? (user.value as { sub?: string; id?: string } | null)?.sub
      ?? (user.value as { id?: string } | null)?.id
      ?? null,
  )
  const accessToken = computed(() => session.value?.access_token ?? null)
  const isAuthenticated = computed(() => !!session.value?.access_token)

  async function loginWithPassword(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password })
  }

  async function signUpWithPassword(email: string, password: string) {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/confirm`,
      },
    })
  }

  async function resetPassword(email: string) {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
  }

  async function updatePassword(newPassword: string) {
    return supabase.auth.updateUser({ password: newPassword })
  }

  async function loginWithGoogle() {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/confirm` },
    })
  }

  async function logout() {
    await supabase.auth.signOut()
    await navigateTo('/login')
  }

  return {
    session, userId, accessToken, isAuthenticated,
    loginWithPassword, signUpWithPassword, resetPassword, updatePassword,
    loginWithGoogle, logout,
  }
})
