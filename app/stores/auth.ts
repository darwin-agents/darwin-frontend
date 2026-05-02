import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const session = useSupabaseSession()

  const userId = computed(() => user.value?.id ?? null)
  const accessToken = computed(() => session.value?.access_token ?? null)
  const isAuthenticated = computed(() => !!session.value?.access_token)

  async function loginWithMagicLink(email: string) {
    return supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })
  }

  async function loginWithGoogle() {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  async function logout() {
    await supabase.auth.signOut()
    await navigateTo('/login')
  }

  return { session, userId, accessToken, isAuthenticated, loginWithMagicLink, loginWithGoogle, logout }
})
